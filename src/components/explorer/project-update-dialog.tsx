// components/project-update-dialog.tsx
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ProjectUpdateDialogProps {
    projectCid: string;
    existingMilestones?: any[];
}

export function ProjectUpdateDialog({ projectCid, existingMilestones }: ProjectUpdateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [updateType, setUpdateType] = useState<'status' | 'milestone' | 'general'>('general');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: '',
        milestoneId: '',
        completionPercentage: '',
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updateData = {
                type: updateType,
                data: formData,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(`/api/ipfs/${projectCid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'update',
                    data: updateData
                })
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            // Reset form and close dialog
            setFormData({
                title: '',
                description: '',
                status: '',
                milestoneId: '',
                completionPercentage: '',
            });

            // Refresh page or update state as needed
            window.location.reload();

        } catch (error) {
            console.error('Error updating project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Select
                            onValueChange={(value: 'status' | 'milestone' | 'general') => setUpdateType(value)}
                            defaultValue="general"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select update type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Update</SelectItem>
                                <SelectItem value="status">Status Update</SelectItem>
                                <SelectItem value="milestone">Milestone Update</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {updateType === 'general' && (
                        <>
                            <div>
                                <label className="text-sm font-medium">Update Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {updateType === 'status' && (
                        <div>
                            <label className="text-sm font-medium">New Status</label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {updateType === 'milestone' && existingMilestones && (
                        <>
                            <div>
                                <label className="text-sm font-medium">Select Milestone</label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, milestoneId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select milestone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {existingMilestones.map((milestone) => (
                                            <SelectItem key={milestone.id} value={milestone.id}>
                                                {milestone.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Completion Percentage</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.completionPercentage}
                                    onChange={(e) => setFormData({ ...formData, completionPercentage: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Project'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}