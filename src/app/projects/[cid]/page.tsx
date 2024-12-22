// src/app/projects/[cid]/page.tsx
'use client'

import { useState, useEffect, use, Usable } from 'react'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Edit,
    Plus,
    History,
    ExternalLink,
    Loader2,
    Bitcoin
} from "lucide-react"
import { format } from 'date-fns'
import { Milestone, ProjectData } from '@/lib/types/types'
import { Badge } from '@/components/ui/badge'
import { Transaction } from '@/lib/wallet/types'

export default function ProjectPage({ params }: { params: Usable<{ cid: string }> }) {
    const router = useRouter()
    const [project, setProject] = useState<ProjectData | null>(null)
    const [loading, setLoading] = useState(true)
    const [txs, setTransaction] = useState<Transaction[]>([])
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)
    const { cid } = use(params)
    useEffect(() => {

        fetchProjectAndTransactions()
    }, [])

    const fetchProjectAndTransactions = async () => {
        try {
            const [projectRes] = await Promise.all([
                fetch(`/api/ipfs/${cid}`),

            ]);

            const projectData: ProjectData = await projectRes.json();
            const [txRes] = await Promise.all([
                fetch(`/api/bitcoin/store/${cid}`, {
                    method: "POST",
                    body: JSON.stringify({
                        contractorAddress: projectData.contractor.address
                    })
                }),

            ]);
            const txData = await txRes.json();

            setProject(projectData);
            setTransaction(txData)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
    if (!project) return <center>Project not found</center>
    else
        return (
            <div className="container py-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between">
                            <div>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>
                                    {project.description}
                                </CardDescription>
                            </div>

                        </div>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="overview">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="history">Update History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Project Stats */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Project Details</h3>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm text-muted-foreground">Status</dt>
                                                <dd className="font-medium">{project.status}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-muted-foreground">Department</dt>
                                                <dd>{project.department}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-muted-foreground">Location</dt>
                                                <dd>
                                                    {project.location.area}, {project.location.city}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Budget Info */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Budget</h3>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm text-muted-foreground">Total Budget</dt>
                                                <dd className="font-medium">{project.budget.total} BTC</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-muted-foreground">Spent</dt>
                                                <dd>{project.budget.spent} BTC</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Overall Progress</span>
                                        <span>
                                            {project.milestones?.filter((m: Milestone) => m.status === 'completed').length || 0}/
                                            {project.milestones?.length || 0} Milestones
                                        </span>
                                    </div>
                                    <Progress value={
                                        ((project.milestones?.filter((m: Milestone) => m.status === 'completed').length || 0) /
                                            (project.milestones?.length || 1)) * 100
                                    } />
                                </div>
                            </TabsContent>

                            <TabsContent value="milestones">
                                <div className="space-y-4">
                                    {project.milestones?.map((milestone: Milestone, index: number) => (
                                        <Card key={milestone.id}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{milestone.title}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {milestone.description}
                                                        </p>
                                                    </div>
                                                    <Badge variant={
                                                        milestone.status === 'completed' ? 'default' :
                                                            milestone.status === 'in_progress' ? 'secondary' : 'outline'
                                                    }>
                                                        {milestone.status}
                                                    </Badge>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Progress</span>
                                                        <span>{milestone.completionPercentage}%</span>
                                                    </div>
                                                    <Progress value={milestone.completionPercentage} />
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Start:</span>
                                                        <span className="ml-2">
                                                            {format(new Date(milestone.startDate), 'PP')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">End:</span>
                                                        <span className="ml-2">
                                                            {format(new Date(milestone.endDate), 'PP')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="transactions">
                                <div className="space-y-4">
                                    {/* Transaction Summary */}
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium">Total Transactions</h4>
                                                    <p className="text-2xl font-bold">{txs?.length || 0}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium">Total Paid</h4>
                                                    <p className="text-2xl font-bold">
                                                        {(txs?.reduce((sum, tx) =>
                                                            tx.type === 'payment' ? sum + tx.amount : sum, 0
                                                        ) / 100000000).toFixed(8)} BTC
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium">Last Update</h4>
                                                    <p className="text-2xl font-bold">
                                                        {txs?.length ?
                                                            format(new Date(txs[0].timestamp), 'MMM d') :
                                                            'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Transaction List */}
                                    {txs?.map((tx: any) => (
                                        <Card key={tx.txId}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {tx.type === 'payment' ? (
                                                                <Bitcoin className="h-4 w-4 text-green-500" />
                                                            ) : tx.type === 'update' ? (
                                                                <Edit className="h-4 w-4 text-blue-500" />
                                                            ) : (
                                                                <Plus className="h-4 w-4 text-purple-500" />
                                                            )}
                                                            <span className="font-medium capitalize">{tx.type}</span>
                                                            {tx.type === 'payment' && (
                                                                <span className="text-sm text-green-600">
                                                                    {(tx.amount / 100000000).toFixed(8)} BTC
                                                                </span>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={`https://mempool.space/testnet/tx/${tx.txId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-500 hover:underline flex items-center mt-1"
                                                        >
                                                            {tx.txId.substring(0, 8)}...{tx.txId.substring(58)}
                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                                                            {tx.status === 'confirmed' ? (
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <Clock className="h-3 w-3 mr-1" />
                                                            )}
                                                            {tx.status}
                                                        </Badge>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {format(new Date(tx.timestamp), 'PPp')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Confirmations:</span>
                                                        <span className="ml-2 font-medium">{tx.confirmations}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Fee:</span>
                                                        <span className="ml-2 font-medium">{tx.fee} sats</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Type:</span>
                                                        <span className="ml-2 font-medium capitalize">{tx.type}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="history">
                                <div className="space-y-4">
                                    {project.updateHistory?.map((update, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {update.type === 'creation' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <History className="h-4 w-4" />
                                                        )}
                                                        <span className="font-medium">
                                                            {update.type === 'creation' ? 'Project Created' : 'Update'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(new Date(update.timestamp), 'PPp')}
                                                    </span>
                                                </div>

                                                {update.changes?.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {update.changes.map((change, i) => (
                                                            <div key={i} className="text-sm">
                                                                <span className="text-muted-foreground">
                                                                    {change.field}:
                                                                </span>
                                                                <span className="line-through text-red-500 mx-2">
                                                                    {change.oldValue}
                                                                </span>
                                                                <span className="text-green-500">
                                                                    {change.newValue}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {update.txId && (
                                                    <a
                                                        href={`https://mempool.space/testnet/tx/${update.txId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 text-sm text-blue-500 hover:underline flex items-center"
                                                    >
                                                        View Transaction
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Update Dialog */}
                <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Project</DialogTitle>
                        </DialogHeader>
                        {/* Add your update form here */}
                    </DialogContent>
                </Dialog>
            </div>
        )
}