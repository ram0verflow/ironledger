// src/app/explorer/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface Project {
    id: string
    name: string
    budget: number
    spent: number
    status: 'pending' | 'active' | 'completed'
    txId: string
    ipfsHash: string
}

export default function ExplorerPage() {
    const projects: Project[] = [
        {
            id: '1',
            name: 'Road Construction Project',
            budget: 1000000,
            spent: 400000,
            status: 'active',
            txId: '1234567890abcdef',
            ipfsHash: 'QmXyz...'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Project Explorer</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by Transaction ID or IPFS Hash"
                        className="max-w-xl"
                    />
                    <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Budget:</span>
                                    <span className="font-medium">
                                        ${project.budget.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Spent:</span>
                                    <span className="font-medium">
                                        ${project.spent.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="capitalize font-medium">
                                        {project.status}
                                    </span>
                                </div>
                                <div className="pt-2 space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Tx ID: {project.txId}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        IPFS: {project.ipfsHash}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}