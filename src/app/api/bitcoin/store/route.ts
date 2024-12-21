import { NextResponse } from 'next/server';
import { BitcoinService } from '@/lib/blockchain/bitcoin';

const bitcoinService = new BitcoinService({
    network: process.env.BITCOIN_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
    mempoolUrl: process.env.MEMPOOL_URL
});

export async function POST(request: Request) {
    try {
        const { ipfsHash } = await request.json();
        const txId = await bitcoinService.publishIPFSHash(
            ipfsHash,
            process.env.BITCOIN_PRIVATE_KEY!
        );

        return NextResponse.json({ txId });
    } catch (error) {
        console.error('Bitcoin storage error:', error);
        return NextResponse.json(
            { error: 'Failed to store in Bitcoin' },
            { status: 500 }
        );
    }
}