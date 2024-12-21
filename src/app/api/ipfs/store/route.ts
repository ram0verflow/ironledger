// src/app/api/ipfs/route.ts
import { NextResponse } from 'next/server';
import { IPFSService } from '@/lib/ipfs/ipfs';

const ipfs = new IPFSService();

export async function POST(request: Request) {
    try {
        const connected = await ipfs.checkConnection();
        if (!connected) {
            return NextResponse.json(
                { error: 'IPFS node not available' },
                { status: 503 }
            );
        }

        const projectData = await request.json();
        const cid = await ipfs.publishProject(projectData);

        return NextResponse.json({ cid });
    } catch (error) {
        console.error('IPFS error:', error);
        return NextResponse.json(
            { error: 'Failed to store in IPFS' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
        return NextResponse.json(
            { error: 'CID parameter is required' },
            { status: 400 }
        );
    }

    try {
        const project = await ipfs.getProject(cid);
        return NextResponse.json(project);
    } catch (error) {
        console.error('IPFS error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve from IPFS' },
            { status: 500 }
        );
    }
}