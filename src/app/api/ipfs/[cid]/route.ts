// src/app/api/projects/[cid]/append/route.ts
import { NextResponse } from 'next/server';
import { IPFSService } from '@/lib/ipfs/ipfs';
import { BitcoinService } from '@/lib/blockchain/bitcoin';
import { ProjectData } from '@/lib/types/types';
import { crypto } from 'bitcoinjs-lib';
const ipfs = new IPFSService();
const bitcoin = new BitcoinService({
    network: process.env.BITCOIN_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
    mempoolUrl: process.env.MEMPOOL_URL
});
export async function GET(
    request: Request,
    { params }: { params: { cid: string } }
) {
    try {
        // Get existing project
        const currentProject = await ipfs.getProject(params.cid);




        return NextResponse.json({
            ...currentProject
        });
    } catch (error) {
        console.error('Error appending to project:', error);
        return NextResponse.json(
            { error: 'Failed to append to project' },
            { status: 500 }
        );
    }
}
// src/app/api/projects/[cid]/append/route.ts
export async function POST(
    request: Request,
    { params }: { params: { cid: string } }
) {
    try {
        const currentProject = await ipfs.getProject(params.cid);
        const { type, update, payment, milestone } = await request.json();
        const timestamp = new Date().toISOString();

        // Create updated project with all modifications
        const updatedProject = (() => {
            const base = { ...currentProject };

            // If it's a payment transaction
            if (type === 'payment' && payment) {
                base.budget = {
                    ...base.budget,
                    spent: (base.budget?.spent || 0) + payment.amount
                };

                // Update milestone if payment is associated with one
                if (payment.milestoneId && base.milestones) {
                    base.milestones = base.milestones.map(m =>
                        m.id === payment.milestoneId
                            ? { ...m, status: 'completed', paidAmount: payment.amount }
                            : m
                    );
                }
            }

            // If it's an update
            if (type === 'update' && update) {
                switch (update.type) {
                    case 'status':
                        base.status = update.data.status;
                        break;

                    case 'milestone':
                        if (base.milestones) {
                            base.milestones = base.milestones.map(m =>
                                m.id === update.data.milestoneId
                                    ? {
                                        ...m,
                                        completionPercentage: update.data.completionPercentage,
                                        lastUpdated: timestamp
                                    }
                                    : m
                            );
                        }
                        break;

                    case 'general':
                        if (update.data.title) base.title = update.data.title;
                        if (update.data.description) base.description = update.data.description;
                        break;
                }
            }

            // Add new milestone if provided
            if (milestone) {
                base.milestones = [...(base.milestones || []), milestone];
            }

            return {
                ...base,
                updateHistory: [
                    ...(base.updateHistory || []),
                    {
                        type,
                        ...(update || {}),
                        ...(payment ? { payment } : {}),
                        timestamp,
                        previousCid: params.cid
                    }
                ],
                version: (base.version || 0) + 1,
                lastUpdated: timestamp
            };
        })();

        // Store updated project in IPFS and unpin previous version
        const newCid = await ipfs.publishProject(updatedProject, params.cid);

        // Create Bitcoin transaction based on type
        let txId;
        console.log(newCid, params.cid)
        if (type === 'payment') {
            // Payment transaction with both IPFS hash and payment data
            txId = await bitcoin.publishUpdate(
                `PAY:${crypto.sha256(Buffer.from(`${params.cid}:${newCid}`)).toString()}`,
                process.env.BITCOIN_PRIVATE_KEY!,
                payment.contractorAddress,
                payment.amount
            );
        } else {
            // Regular update with just IPFS hash
            txId = await bitcoin.publishUpdate(
                `UPDATE:${crypto.sha256(Buffer.from(`${params.cid}:${newCid}`)).toString()}`,
                process.env.BITCOIN_PRIVATE_KEY!
            );
        }

        return NextResponse.json({
            success: true,
            cid: newCid,
            txId,
            project: updatedProject
        });

    } catch (error) {
        console.error('Error appending to project:', error);
        return NextResponse.json(
            { error: 'Failed to append to project' },
            { status: 500 }
        );
    }
}