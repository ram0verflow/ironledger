// src/app/projects/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, ExternalLink, FileText } from "lucide-react"

interface Project {
    cid: string;
    data: {
        title: string;
        description: string;
        budget: number;
        contractorAddress: string;
        transactions?: Array<{
            date: string;
            amount: number;
            description: string;
            txId: string;
        }>;
    };
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isGovernment, setIsGovernment] = useState(false);

    useEffect(() => {
        const userAddress = localStorage.getItem('userAddress');
        const govAddress = process.env.NEXT_PUBLIC_GOVERNMENT_ADDRESS;
        setIsGovernment(userAddress === govAddress);
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/ipfs/list');
            const data = await response.json();
            setProjects(data.projects);
        } catch (error) {
            setError('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            budget: parseFloat(formData.get('budget') as string),
            contractorAddress: formData.get('contractorAddress'),
            transactions: []
        };

        try {
            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) throw new Error('Failed to create project');

            await fetchProjects();
        } catch (error) {
            setError('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>, projectCid: string) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const transactionData = {
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description'),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch(`/api/projects/${projectCid}/append`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) throw new Error('Failed to add transaction');

            await fetchProjects();
            setSelectedProject(null);
        } catch (error) {
            setError('Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
                {isGovernment && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div className="space-y-2">
                                    <label>Title</label>
                                    <Input name="title" required />
                                </div>
                                <div className="space-y-2">
                                    <label>Description</label>
                                    <Textarea name="description" required />
                                </div>
                                <div className="space-y-2">
                                    <label>Budget (BTC)</label>
                                    <Input
                                        name="budget"
                                        type="number"
                                        step="0.00000001"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label>Contractor Address</label>
                                    <Input name="contractorAddress" required />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Project'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Card key={project.cid}>
                        <CardHeader>
                            <CardTitle>{project.data.title}</CardTitle>
                            <CardDescription>
                                Budget: {project.data.budget} BTC
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {project.data.description}
                            </p>

                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium">IPFS CID:</span>
                                    <code className="ml-2 p-1 bg-muted rounded text-xs">
                                        {project.cid}
                                    </code>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Contractor:</span>
                                    <code className="ml-2 p-1 bg-muted rounded text-xs">
                                        {project.data.contractorAddress}
                                    </code>
                                </div>
                            </div>

                            {/* {project.data.transactions?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Transactions</h4>
                                    <div className="space-y-2">
                                        {project.data.transactions.map((tx, i) => (
                                            <div key={i} className="text-sm p-2 bg-muted rounded">
                                                <div className="flex justify-between">
                                                    <span>{tx.amount} BTC</span>
                                                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {tx.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} */}

                            {isGovernment && (
                                <Button
                                    className="w-full mt-4"
                                    variant="outline"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    Add Transaction
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Transaction Dialog */}
            <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Transaction to {selectedProject?.data.title}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => selectedProject && handleAddTransaction(e, selectedProject.cid)} className="space-y-4">
                        <div className="space-y-2">
                            <label>Amount (BTC)</label>
                            <Input
                                name="amount"
                                type="number"
                                step="0.00000001"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Description</label>
                            <Textarea name="description" required />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}