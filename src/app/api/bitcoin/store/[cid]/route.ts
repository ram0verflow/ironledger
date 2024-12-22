import { NextResponse } from "next/server";
import { BitcoinService } from '@/lib/blockchain/bitcoin';

const bitcoinService = new BitcoinService({
    network: process.env.BITCOIN_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
    mempoolUrl: process.env.MEMPOOL_URL
});

export async function POST(
    request: Request,
    { params }: { params: { cid: string } }
) {
    try {
        const { contractorAddress } = await request.json()
        if (!contractorAddress) {
            return NextResponse.json(
                { error: 'No Contractor Address passed' },
                { status: 400 }
            );
        }
        const transactions = await bitcoinService.getProjectTransactions(params.cid, process.env.NEXT_PUBLIC_TESTNET_ADDR!, contractorAddress);
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}