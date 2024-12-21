// src/app/projects/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

export default function CreateProject() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState<string>('');
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const projectData = {
                id: crypto.randomUUID(),
                title: formData.get('title'),
                description: formData.get('description'),
                department: formData.get('department'),
                category: formData.get('category'),
                location: {
                    city: formData.get('city'),
                    state: formData.get('state'),
                    area: formData.get('area'),
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
                status: 'Proposed',
                updates: [],
                lastUpdated: new Date().toISOString()
            }
            setCurrentStep('Storing project data in IPFS...');
            const response = await fetch('/api/ipfs/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            })
            const { cid } = await response.json()
            console.log(cid)
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
            await fetch('/api/projects/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipfsHash: cid, txId })
            });
            router.push('/projects')
            router.refresh()
        } catch (error) {
            console.error('Error creating project:', error)
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
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Basic Information</h3>

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
                                </div>
                            </div>
                        </div>

                        {/* Location */}
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

                        {/* Budget & Timeline */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Budget & Timeline</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Budget (BTC)</label>
                                    <Input name="budget" type="number" step="0.00000001" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Total Milestones</label>
                                    <Input name="totalMilestones" type="number" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input name="startDate" type="date" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Expected End Date</label>
                                    <Input name="endDate" type="date" required />
                                </div>
                            </div>
                        </div>

                        {/* Contractor Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Contractor Information</h3>
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

                        {loading ? (
                            <div className="space-y-4">
                                <Progress value={33} />
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {currentStep}
                                </p>
                            </div>
                        ) : (
                            <Button type="submit" className="w-full">
                                Publish Project
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
