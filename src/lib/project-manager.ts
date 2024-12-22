// src/lib/project-manager.ts
import { IPFSService } from './ipfs/ipfs';
import { BitcoinService } from './blockchain/bitcoin';
import { ProjectData } from './types/types';

export interface ProjectReference {
    projectId: string;
    ipfsHash: string;
    txId: string;
    status: 'pending' | 'confirmed';
    timestamp: number;
}

export class ProjectManager {
    private projects: Map<string, ProjectReference> = new Map();

    constructor(
        private ipfsService: IPFSService,
        private bitcoinService: BitcoinService
    ) { }

    async publishProject(
        project: ProjectData,
        privateKey: string
    ): Promise<ProjectReference> {
        try {
            // Store project data in IPFS
            const ipfsHash = await this.ipfsService.publishProject(project);

            // Store IPFS hash in Bitcoin blockchain
            const txId = await this.bitcoinService.publishIPFSHash(ipfsHash, privateKey);

            const projectRef: ProjectReference = {
                projectId: project.id,
                ipfsHash,
                txId,
                status: 'pending',
                timestamp: Date.now(),
            };

            this.projects.set(project.id, projectRef);
            return projectRef;
        } catch (error) {
            console.error('Error publishing project:', error);
            throw error;
        }
    }

    async verifyProject(projectId: string): Promise<boolean> {
        const projectRef = this.projects.get(projectId);
        if (!projectRef) return false;

        try {
            // Verify Bitcoin transaction
            const txVerification = await this.bitcoinService.verifyIPFSHash(projectRef.txId);
            if (!txVerification.verified) return false;

            // Verify IPFS data matches
            if (txVerification.ipfsHash !== projectRef.ipfsHash) return false;

            // Get project data from IPFS
            const projectData = await this.ipfsService.getProject(projectRef.ipfsHash);
            return projectData.id === projectId;
        } catch {
            return false;
        }
    }

    async getProjectDetails(projectId: string): Promise<{
        reference: ProjectReference;
        data: ProjectData;
    } | null> {
        const projectRef = this.projects.get(projectId);
        if (!projectRef) return null;

        try {
            const projectData = await this.ipfsService.getProject(projectRef.ipfsHash);
            return { reference: projectRef, data: projectData };
        } catch {
            return null;
        }
    }

    async updateProjectStatus(projectId: string): Promise<void> {
        const projectRef = this.projects.get(projectId);
        if (!projectRef) return;

        const status = await this.bitcoinService.getTransactionStatus(projectRef.txId);
        projectRef.status = status === 'confirmed' ? 'confirmed' : 'pending';
        this.projects.set(projectId, projectRef);
    }
}