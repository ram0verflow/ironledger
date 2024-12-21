import { NextResponse } from 'next/server';
import { IPFSService } from '@/lib/ipfs/ipfs';

const ipfs = new IPFSService();

export async function GET() {
    try {
        // Get all pinned content
        const response = await fetch('http://localhost:5001/api/v0/pin/ls');
        const { Keys } = await response.json();

        // Fetch project data for each CID
        const projects = await Promise.all(
            Object.keys(Keys).map(async (cid) => {
                try {
                    // Get content for each CID
                    const response = await fetch(
                        `http://localhost:5001/api/v0/cat?arg=${cid}`
                    );
                    const data = await response.json();

                    // Only return if it's a valid project
                    if (data.title && data.description) {
                        return { cid, data };
                    }
                    return null;
                } catch {
                    return null;
                }
            })
        );

        // Filter out nulls and sort by date if available
        const validProjects = projects
            .filter(Boolean)
            .sort((a, b) => {
                const dateA = new Date(a?.data.createdAt || 0);
                const dateB = new Date(b?.data.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

        return NextResponse.json({ projects: validProjects });
    } catch (error) {
        console.error('Error listing IPFS projects:', error);
        return NextResponse.json(
            { error: 'Failed to list projects' },
            { status: 500 }
        );
    }
}
