// src/components/project-milestones.tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2, Calendar } from "lucide-react"
import { format } from 'date-fns'
import { Milestone } from '@/lib/types/types'




export function ProjectMilestones({
    projectCid,
    milestones,
    onUpdate
}: {
    projectCid: string;
    milestones: Milestone[];
    onUpdate: () => void;
}) {
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const newMilestone = {
            id: crypto.randomUUID(),
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            completionPercentage: 0,
            expenditure: parseFloat(formData.get('expenditure') as string),
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            status: 'pending' as const
        };

        try {
            const response = await fetch(`/api/projects/${projectCid}/milestones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    milestone: newMilestone,
                    update: {
                        type: 'milestone_added',
                        timestamp: new Date().toISOString(),
                        updatedBy: localStorage.getItem('userAddress'),
                        changes: [{
                            field: 'milestones',
                            oldValue: null,
                            newValue: newMilestone
                        }]
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to add milestone');

            onUpdate();
            setIsAddingMilestone(false);
        } catch (error) {
            console.error('Error adding milestone:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingMilestone) return;
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const updatedMilestone = {
            ...editingMilestone,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            completionPercentage: parseFloat(formData.get('completionPercentage') as string),
            expenditure: parseFloat(formData.get('expenditure') as string),
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            status: formData.get('status') as Milestone['status']
        };

        try {
            const response = await fetch(`/api/projects/${projectCid}/milestones/${editingMilestone.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    milestone: updatedMilestone,
                    update: {
                        type: 'milestone_updated',
                        timestamp: new Date().toISOString(),
                        updatedBy: localStorage.getItem('userAddress'),
                        changes: [{
                            field: `milestones.${editingMilestone.id}`,
                            oldValue: editingMilestone,
                            newValue: updatedMilestone
                        }]
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to update milestone');

            onUpdate();
            setEditingMilestone(null);
        } catch (error) {
            console.error('Error updating milestone:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Milestones</h3>
                <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Milestone
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Milestone</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddMilestone} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input name="title" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea name="description" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expected Expenditure (BTC)</label>
                                <Input
                                    name="expenditure"
                                    type="number"
                                    step="0.00000001"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input name="startDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input name="endDate" type="date" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Milestone'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {milestones.map((milestone) => (
                    <div
                        key={milestone.id}
                        className="border rounded-lg p-4 space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium">{milestone.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {milestone.description}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMilestone(milestone)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{milestone.completionPercentage}%</span>
                            </div>
                            <Progress value={milestone.completionPercentage} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Expenditure:</span>
                                <span className="ml-2">{milestone.expenditure} BTC</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status:</span>
                                <span className="ml-2 capitalize">{milestone.status}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(new Date(milestone.startDate), 'PP')}
                            </div>
                            <span>→</span>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(new Date(milestone.endDate), 'PP')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Milestone Dialog */}
            <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Milestone</DialogTitle>
                    </DialogHeader>
                    {editingMilestone && (
                        <form onSubmit={handleUpdateMilestone} className="space-y-4">
                            {/* Same form fields as add milestone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Completion Percentage</label>
                                <Input
                                    name="completionPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={editingMilestone.completionPercentage}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    name="status"
                                    className="w-full border rounded-md h-10 px-3"
                                    defaultValue={editingMilestone.status}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Milestone'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}