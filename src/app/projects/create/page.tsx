// src/app/projects/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Milestone, ProjectData } from '@/lib/types/types'



export default function CreateProject() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [currentStep, setCurrentStep] = useState<string>('');
    const addMilestone = () => {
        setMilestones([
            ...milestones,
            {
                id: crypto.randomUUID(),
                title: '',
                description: '',
                expenditure: 0,
                startDate: '',
                endDate: ''
            }
        ])
    }

    const removeMilestone = (id: string) => {
        setMilestones(milestones.filter(m => m.id !== id))
    }

    const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
        setMilestones(milestones.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const projectData = {
                id: crypto.randomUUID(),
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                department: formData.get('department'),
                location: {
                    city: formData.get('city'),
                    state: formData.get('state'),
                    area: formData.get('area')
                },
                budget: {
                    total: parseFloat(formData.get('budget') as string),
                    allocated: parseFloat(formData.get('budget') as string),
                    spent: 0
                },
                timeline: {
                    startDate: formData.get('startDate'),
                    expectedEndDate: formData.get('endDate'),
                    currentPhase: 'Initial'
                },
                stats: {
                    completionPercentage: 0,
                    milestonesCompleted: 0,
                    totalMilestones: parseInt(formData.get('totalMilestones') as string)
                },
                contractor: {
                    name: formData.get('contractorName'),
                    address: formData.get('contractorAddress')
                },
                milestones: milestones.map(m => ({
                    ...m,
                    completionPercentage: 0,
                    status: 'pending' as const
                })),
                status: 'Proposed',
                updateHistory: [{
                    type: 'creation',
                    timestamp: new Date().toISOString(),
                    updatedBy: localStorage.getItem('userAddress'),
                    changes: []
                }],
                version: 1,
                lastUpdated: new Date().toISOString()
            }
            setCurrentStep('Storing project data in IPFS...');
            const response = await fetch('/api/ipfs/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            })
            alert(response.ok)
            const { cid } = await response.json()
            if (!response.ok) throw new Error('Failed to create project')
            setCurrentStep('Recording on Bitcoin network...');
            const bitcoinResponse = await fetch('/api/bitcoin/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipfsHash: cid })
            });
            const { txId } = await bitcoinResponse.json();
            // Step 3: Record the project reference
            setCurrentStep('Finalizing project creation...');

            router.push('/projects')
        } catch (error) {
            console.error('Error creating project:', error)
            setError('Failed to create project. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-3xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Government Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Project Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Project Details</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium">Project Title</label>
                                    <Input name="title" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea name="description" required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Department</label>
                                        <Input name="department" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <Select name="category" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                <SelectItem value="Education">Education</SelectItem>
                                                <SelectItem value="Technology">Technology</SelectItem>
                                                <SelectItem value="Urban Development">Urban Development</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Total Budget (BTC)</label>
                                        <Input name="budget" type="number" step="0.00000001" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Location</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">City</label>
                                    <Input name="city" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">State</label>
                                    <Input name="state" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Area</label>
                                    <Input name="area" required />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <Input name="startDate" type="date" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Expected End Date</label>
                            <Input name="endDate" type="date" required />
                        </div>
                        {/* Contractor Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Contractor Details</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Contractor Name</label>
                                    <Input name="contractorName" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Bitcoin Address (Testnet)</label>
                                    <Input name="contractorAddress" required />
                                </div>
                            </div>
                        </div>

                        {/* Milestones */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Project Milestones</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addMilestone}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Milestone
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {milestones.map((milestone, index) => (
                                    <Card key={milestone.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-medium">Milestone {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeMilestone(milestone.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Title</label>
                                                    <Input
                                                        value={milestone.title}
                                                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Description</label>
                                                    <Textarea
                                                        value={milestone.description}
                                                        onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Expected Expenditure (BTC)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.00000001"
                                                        value={milestone.expenditure}
                                                        onChange={(e) => updateMilestone(milestone.id, 'expenditure', parseFloat(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={milestone.startDate}
                                                            onChange={(e) => updateMilestone(milestone.id, 'startDate', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={milestone.endDate}
                                                            onChange={(e) => updateMilestone(milestone.id, 'endDate', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {currentStep}
                                </>
                            ) : (
                                'Publish Project'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}