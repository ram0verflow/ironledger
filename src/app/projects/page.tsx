// src/app/projects/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, ExternalLink } from "lucide-react"
import Link from 'next/link'
import { Project } from '@/lib/types/types'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isGovernment, setIsGovernment] = useState(false);
    const router = useRouter()
    useEffect(() => {
        const userAddress = localStorage.getItem('userAddress');
        const govAddress = process.env.NEXT_PUBLIC_TESTNET_ADDR;
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
            const response = await fetch(`/api/ipfs/${projectCid}`, {
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

                    <Link href="/projects/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </Link>

                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {projects?.map((project) => (

                    <Card key={project.cid} className="flex flex-col">
                        <div className="flex items-center justify-between p-6">
                            <CardHeader className="p-0">
                                <CardTitle className="text-lg sm:text-xl">{project.data.title}</CardTitle>
                                <CardDescription className="mt-2">
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="mr-2">Budget: {project.data.budget?.allocated} BTC</span>
                                        <span>Spent: {project.data.budget?.spent} BTC</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <ExternalLink
                                className='text-foreground/60 text-sm cursor-pointer hover:text-foreground/100'
                                onClick={() => router.push(`/projects/${project.cid}`)}
                            />
                        </div>

                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                {project.data.description}
                            </p>

                            <div className="text-sm text-muted-foreground mb-4">
                                <p>📍 {project.data.location?.area}, {project.data.location?.city}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium">IPFS CID:</span>
                                    <code className="ml-2 p-1 bg-muted rounded text-xs break-all">
                                        {project.cid}
                                    </code>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Contractor:</span>
                                    <code className="ml-2 p-1 bg-muted rounded text-xs break-all">
                                        {project.data.contractor?.name}
                                    </code>
                                </div>
                            </div>

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