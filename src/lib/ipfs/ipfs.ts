// src/lib/ipfs/ipfs-service.ts
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { CID } from 'multiformats/cid';

export interface ProjectData {
    id: string;
    title: string;
    description: string;
    budget: {
        total: number;
        allocated: number;
        spent: number;
    };
    timeline: {
        start: string;
        end: string;
    };
    department: string;
    contractors: string[];
    milestones: Array<{
        title: string;
        description: string;
        deadline: string;
        budget: number;
        status: 'pending' | 'in_progress' | 'completed';
    }>;
    documents: Array<{
        name: string;
        hash: string;
        type: string;
    }>;
    status: 'proposed' | 'approved' | 'in_progress' | 'completed';
    lastUpdated: string;
    signatures: string[];
}

export class IPFSService {
    private ipfs: IPFSHTTPClient;
    private pinningService: IPFSHTTPClient | null = null;

    constructor(nodeUrl?: string, pinningUrl?: string, pinningKey?: string) {
        // Connect to IPFS node
        this.ipfs = create({
            url: nodeUrl || 'http://localhost:5001/api/v0',
            headers: {
                'X-API-Key': pinningKey || ''
            }
        });

        // Optional pinning service
        if (pinningUrl && pinningKey) {
            this.pinningService = create({
                url: pinningUrl,
                headers: {
                    'X-API-Key': pinningKey
                }
            });
        }
    }

    async publishProject(project: ProjectData): Promise<string> {
        try {
            // Add data to IPFS
            const result = await this.ipfs.add(JSON.stringify(project));
            const cid = result.cid.toString();

            // Pin the data if pinning service is available
            if (this.pinningService) {
                await this.pinningService.pin.add(CID.parse(cid));
            }

            // Verify the data was stored correctly
            const verification = await this.verifyData(cid, project);
            if (!verification.isValid) {
                throw new Error(`Data verification failed: ${verification.error}`);
            }

            return cid;
        } catch (error) {
            console.error('Error publishing to IPFS:', error);
            throw error;
        }
    }

    async getProject(cid: string): Promise<ProjectData> {
        try {
            const stream = this.ipfs.cat(cid);
            let data = '';

            for await (const chunk of stream) {
                data += chunk.toString();
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Error retrieving from IPFS:', error);
            throw error;
        }
    }

    private async verifyData(cid: string, originalData: ProjectData): Promise<{ isValid: boolean; error?: string }> {
        try {
            const retrievedData = await this.getProject(cid);
            const isValid = JSON.stringify(retrievedData) === JSON.stringify(originalData);
            return { isValid };
        } catch (error) {
            return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // Get all project versions (useful for audit trail)
    async getProjectVersions(projectId: string): Promise<string[]> {
        try {
            // In a real implementation, we would maintain a DAG of project versions
            // For now, we'll just return the latest version
            const result = await this.ipfs.dag.get(CID.parse(projectId));
            return [result.value.toString()];
        } catch (error) {
            console.error('Error getting project versions:', error);
            throw error;
        }
    }
}