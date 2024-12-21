// src/lib/ipfs/ipfs-service.ts
import axios from 'axios';
import FormData from 'form-data';

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
    status: 'proposed' | 'approved' | 'in_progress' | 'completed';
    lastUpdated: string;
}

export class IPFSService {
    private baseUrl: string;

    constructor(port: number = 5001) {
        this.baseUrl = `http://127.0.0.1:${port}/api/v0`;
    }

    async checkConnection(): Promise<boolean> {
        try {
            const response = await axios.post(`${this.baseUrl}/id`);
            console.log('IPFS Node ID:', response.data.ID);
            return true;
        } catch (error) {
            console.error('IPFS connection failed:', error);
            return false;
        }
    }
    async publishProject(project: ProjectData): Promise<string> {
        try {
            // Create form data
            const formData = new FormData();
            const blob = new Blob([JSON.stringify(project)], {
                type: 'application/json'
            });
            formData.append('path', Buffer.from(await blob.arrayBuffer()));

            const response = await axios.post(
                `${this.baseUrl}/add`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    // Important: Need these params for IPFS API
                    params: {
                        'stream-channels': true,
                        'progress': false
                    }
                }
            );

            const cid = response.data.Hash;
            console.log(cid)
            await this.pinContent(cid);
            return cid;

        } catch (error) {
            console.error('Error publishing to IPFS:', error);
            throw error;
        }
    }
    async getProject(cid: string): Promise<ProjectData> {
        try {
            const response = await axios.post(`${this.baseUrl}/cat?arg=${cid}`, null, {
                responseType: 'text'
            });

            return JSON.parse(response.data);
        } catch (error) {
            console.error('Error getting project from IPFS:', error);
            throw error;
        }
    }

    async pinContent(cid: string): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/pin/add?arg=${cid}`);
        } catch (error) {
            console.error('Error pinning content:', error);
            throw error;
        }
    }

    async unpinContent(cid: string): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/pin/rm?arg=${cid}`);
        } catch (error) {
            console.error('Error unpinning content:', error);
            throw error;
        }
    }

    async listPins(): Promise<string[]> {
        try {
            const response = await axios.post(`${this.baseUrl}/pin/ls`);
            return Object.keys(response.data.Keys || {});
        } catch (error) {
            console.error('Error listing pins:', error);
            throw error;
        }
    }

    async getNodeInfo(): Promise<any> {
        try {
            const [idResponse, versionResponse] = await Promise.all([
                axios.post(`${this.baseUrl}/id`),
                axios.post(`${this.baseUrl}/version`)
            ]);

            return {
                peerId: idResponse.data.ID,
                version: versionResponse.data.Version,
                addresses: idResponse.data.Addresses
            };
        } catch (error) {
            console.error('Error getting node info:', error);
            throw error;
        }
    }

    async getDagStats(cid: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/dag/stat?arg=${cid}`);
            return response.data;
        } catch (error) {
            console.error('Error getting DAG stats:', error);
            throw error;
        }
    }
}