
export interface Milestone {
    id: string;
    title: string;
    description: string;
    expenditure: number;
    startDate: string;
    status: 'pending' | 'completed' | 'in_progress',
    completionPercentage: number
    endDate: string;
}
export interface ProjectData {
    id: string;
    title: string;
    description: string;
    department: string;
    category: 'Infrastructure' | 'Healthcare' | 'Education' | 'Technology' | 'Urban Development';
    location: {
        city: string;
        state: string;
        area: string;
    };
    budget: {
        total: number;          // In BTC for demo
        allocated: number;
        spent: number;
    };
    timeline: {
        startDate: string;
        expectedEndDate: string;
        currentPhase: string;
    };
    milestones: Milestone[]
    stats: {
        completionPercentage: number;
        milestonesCompleted: number;
        totalMilestones: number;
    };
    contractor: {
        name: string;
        address: string;    // Bitcoin address
    };
    lastUpdated: string;
    status: 'Proposed' | 'In Progress' | 'Completed' | 'Delayed';
    updateHistory: Array<{
        date: string;
        description: string;
        amount?: number;
        txId?: string;
    }>;
    version?: number
}
export interface Project {
    cid: string;
    data: ProjectData
}