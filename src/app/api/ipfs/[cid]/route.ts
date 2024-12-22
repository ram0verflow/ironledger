// src/app/api/projects/[cid]/append/route.ts
import { NextResponse } from 'next/server';
import { IPFSService } from '@/lib/ipfs/ipfs';
import { BitcoinService } from '@/lib/blockchain/bitcoin';

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
export async function POST(
    request: Request,
    { params }: { params: { cid: string } }
) {
    try {
        // Get existing project from current CID
        const currentProject = await ipfs.getProject(params.cid);
        const { update, milestone } = await request.json();

        // Create updated project with new content
        const updatedProject = {
            ...currentProject,
            milestones: milestone ?
                [...(currentProject.milestones || []), milestone] :
                currentProject.milestones,
            updateHistory: [
                ...(currentProject.updateHistory || []),
                {
                    ...update,
                    timestamp: new Date().toISOString(),
                    previousCid: params.cid  // Store the previous CID in history
                }
            ],
            version: (currentProject.version || 0) + 1,
            lastUpdated: new Date().toISOString()
        };

        // Store updated project in IPFS
        const newCid = await ipfs.publishProject(updatedProject);

        // Store both CIDs in Bitcoin OP_RETURN
        // Format: "UPDATE prevCID:newCID"
        const updateData = `UPDATE ${params.cid}:${newCid}`;
        const txId = await bitcoin.publishUpdate(updateData);

        return NextResponse.json({
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