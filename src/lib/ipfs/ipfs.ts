// src/lib/ipfs/helia-service.ts
import { createHelia } from 'helia'
import { json } from '@helia/json'
import { strings } from '@helia/strings'
import { FsBlockstore } from 'blockstore-fs'
import { MemoryBlockstore } from 'blockstore-core'
import { CID } from 'multiformats/cid'
import type { Helia } from '@helia/interface'

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

export class HeliaService {
    private helia: Helia;
    private jsonEncoder: ReturnType<typeof json>;
    private stringEncoder: ReturnType<typeof strings>;
    private readonly isPersistent: boolean;

    constructor(persistent: boolean = false) {
        this.isPersistent = persistent;
    }

    async initialize() {
        try {
            // Choose blockstore based on persistence requirement
            const blockstore = this.isPersistent
                ? new FsBlockstore('./data/ipfs')
                : new MemoryBlockstore();

            // Create Helia instance
            this.helia = await createHelia({
                blockstore,
                libp2p: {
                    start: true,
                }
            });

            // Initialize encoders
            this.jsonEncoder = json(this.helia);
            this.stringEncoder = strings(this.helia);

            console.log('Helia node initialized with PeerId:', this.helia.libp2p.peerId);
            return this;
        } catch (error) {
            console.error('Error initializing Helia:', error);
            throw error;
        }
    }

    async publishProject(project: ProjectData): Promise<string> {
        try {
            if (!this.helia) {
                throw new Error('Helia not initialized');
            }

            // Add data to IPFS using JSON encoder
            const cid = await this.jsonEncoder.add(project);

            // Verify the data was stored correctly
            const verification = await this.verifyData(cid, project);
            if (!verification.isValid) {
                throw new Error(`Data verification failed: ${verification.error}`);
            }

            return cid.toString();
        } catch (error) {
            console.error('Error publishing to IPFS:', error);
            throw error;
        }
    }

    async getProject(cidString: string): Promise<ProjectData> {
        try {
            if (!this.helia) {
                throw new Error('Helia not initialized');
            }

            const cid = CID.parse(cidString);
            const data = await this.jsonEncoder.get(cid);

            if (!this.isValidProjectData(data)) {
                throw new Error('Invalid project data structure');
            }

            return data;
        } catch (error) {
            console.error('Error retrieving from IPFS:', error);
            throw error;
        }
    }

    private async verifyData(cid: CID, originalData: ProjectData): Promise<{ isValid: boolean; error?: string }> {
        try {
            const retrievedData = await this.jsonEncoder.get(cid);
            const isValid = JSON.stringify(retrievedData) === JSON.stringify(originalData);
            return { isValid };
        } catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private isValidProjectData(data: any): data is ProjectData {
        return (
            data &&
            typeof data.id === 'string' &&
            typeof data.title === 'string' &&
            typeof data.description === 'string' &&
            typeof data.budget === 'object' &&
            Array.isArray(data.contractors) &&
            Array.isArray(data.milestones) &&
            typeof data.status === 'string'
        );
    }

    async addPin(cid: string): Promise<void> {
        try {
            if (!this.helia) {
                throw new Error('Helia not initialized');
            }

            await this.helia.pins.add(CID.parse(cid));
        } catch (error) {
            console.error('Error pinning content:', error);
            throw error;
        }
    }

    async removePin(cid: string): Promise<void> {
        try {
            if (!this.helia) {
                throw new Error('Helia not initialized');
            }

            await this.helia.pins.remove(CID.parse(cid));
        } catch (error) {
            console.error('Error unpinning content:', error);
            throw error;
        }
    }

    async getPins(): Promise<string[]> {
        try {
            if (!this.helia) {
                throw new Error('Helia not initialized');
            }

            const pins: string[] = [];
            for await (const pin of this.helia.pins.ls()) {
                pins.push(pin.toString());
            }
            return pins;
        } catch (error) {
            console.error('Error getting pins:', error);
            throw error;
        }
    }

    async shutdown(): Promise<void> {
        try {
            if (this.helia) {
                await this.helia.stop();
            }
        } catch (error) {
            console.error('Error shutting down Helia:', error);
            throw error;
        }
    }
}