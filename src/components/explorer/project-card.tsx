'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Building2, Bitcoin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { ProjectData } from "@/lib/types/types"

const statusColors = {
    'Proposed': 'bg-yellow-500',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Delayed': 'bg-red-500'
} as const;

export function ProjectCard({ project }: { project: ProjectData }) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <CardTitle className="text-lg sm:text-xl mb-1">{project.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 mr-1" />
                        {project.department}
                    </div>
                </div>
                <Badge className={`${statusColors[project.status]} mt-2 sm:mt-0`}>
                    {project.status}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{project.location.area}, {project.location.city}</span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.stats.completionPercentage}%</span>
                    </div>
                    <Progress value={project.stats.completionPercentage} />
                </div>

                {/* Budget Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2 pt-2">
                    <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold">
                            {project.budget.total.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total BTC</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold">
                            {project.budget.spent.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">Spent BTC</div>
                    </div>
                    <div className="text-center col-span-2 sm:col-span-1">
                        <div className="text-lg sm:text-2xl font-bold">
                            {project.stats.milestonesCompleted}/{project.stats.totalMilestones}
                        </div>
                        <div className="text-xs text-muted-foreground">Milestones</div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="text-sm space-y-1">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{new Date(project.timeline.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between">
                        <span className="text-muted-foreground">Expected End:</span>
                        <span>{new Date(project.timeline.expectedEndDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between">
                        <span className="text-muted-foreground">Current Phase:</span>
                        <span>{project.timeline.currentPhase}</span>
                    </div>
                </div>

                {/* Recent Updates */}
                {project.updates.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
                        <div className="space-y-2">
                            {project.updates.slice(-2).map((update, i) => (
                                <div key={i} className="text-sm bg-muted/50 p-2 rounded">
                                    <div className="flex flex-col sm:flex-row justify-between text-xs text-muted-foreground mb-1">
                                        <span>{new Date(update.date).toLocaleDateString()}</span>
                                        {update.amount && (
                                            <span className="flex items-center mt-1 sm:mt-0">
                                                <Bitcoin className="h-3 w-3 mr-1" />
                                                {update.amount.toFixed(8)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs">{update.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

