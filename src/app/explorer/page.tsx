// src/app/projects/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Search } from "lucide-react"
import { Project } from '../projects/page'
export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isGovernment, setIsGovernment] = useState(false);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);


    // Extract unique cities and areas from projects
    const { cities, areas } = useMemo(() => {
        const cities = new Set<string>();
        const areas = new Set<string>();

        projects.forEach(project => {
            if (project.data.location?.city) {
                cities.add(project.data.location.city);
            }
            if (project.data.location?.area) {
                areas.add(project.data.location.area);
            }
        });

        return {
            cities: Array.from(cities),
            areas: Array.from(areas)
        };
    }, [projects]);

    // Filtered projects based on search and location filters
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchLower === '' ? true : (
                project.data.title?.toLowerCase().includes(searchLower) ||
                project.data.description?.toLowerCase().includes(searchLower) ||
                project.cid.toLowerCase().includes(searchLower) ||
                project.data.contractor?.name?.toLowerCase().includes(searchLower)
            );

            // Location filters
            const matchesCity = !selectedCity || project.data.location?.city === selectedCity;
            const matchesArea = !selectedArea || project.data.location?.area === selectedArea;

            return matchesSearch && matchesCity && matchesArea;
        });
    }, [projects, searchQuery, selectedCity, selectedArea]);

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

    const handleCityChange = (value: string) => {
        setSelectedCity(value === 'all' ? null : value);
    };

    const handleAreaChange = (value: string) => {
        setSelectedArea(value === 'all' ? null : value);
    };
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCity(null);
        setSelectedArea(null);
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
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Project Explorer</h1>
                    <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        size="sm"
                    >
                        Reset Filters
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <Select
                        value={selectedCity || 'all'}
                        onValueChange={handleCityChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by City" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map(city => (
                                <SelectItem key={city} value={city}>
                                    {city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedArea || 'all'}
                        onValueChange={handleAreaChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Area" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            {areas.map(area => (
                                <SelectItem key={area} value={area}>
                                    {area}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {(searchQuery || selectedCity || selectedArea) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                        {(selectedCity || selectedArea) && (
                            <span>
                                {selectedCity && `• City: ${selectedCity}`}
                                {selectedArea && `• Area: ${selectedArea}`}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="text-sm text-muted-foreground">
                Found {filteredProjects.length} projects
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {filteredProjects.map((project) => (
                    <Card key={project.cid}>
                        <CardHeader>
                            <CardTitle>{project.data.title}</CardTitle>
                            <CardDescription>
                                Budget: {project.data.budget?.allocated} BTC
                                Spent: {project.data.budget?.spent} BTC
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {project.data.description}
                            </p>

                            {/* Add location info */}
                            <div className="text-sm text-muted-foreground mb-4">
                                <p>📍 {project.data.location?.area}, {project.data.location?.city}</p>
                            </div>

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
                                        {project.data.contractor?.name}
                                    </code>
                                </div>
                            </div>
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