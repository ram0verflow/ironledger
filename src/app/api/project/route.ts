// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { IPFSService } from '@/lib/ipfs/ipfs';

const ipfsService = new IPFSService();

export async function POST(request: Request) {
    try {
        await ipfsService.initialize();
        const projectData = await request.json();

        const cid = await ipfsService.publishProject(projectData);

        return NextResponse.json({ cid });
    } catch (error) {
        console.error('Error handling project creation:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
        return NextResponse.json(
            { error: 'CID is required' },
            { status: 400 }
        );
    }

    try {
        await ipfsService.initialize();
        const project = await ipfsService.getProject(cid);

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error retrieving project:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve project' },
            { status: 500 }
        );
    }
}