// src/app/projects/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface ProjectFormData {
    title: string;
    description: string;
    totalBudget: number;
    department: string;
    timeline: {
        start: string;
        end: string;
    };
    contractors: string[];
}

export default function CreateProjectPage() {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>('');

    const form = useForm<ProjectFormData>();

    const onSubmit = async (data: ProjectFormData) => {
        setIsPublishing(true);
        try {
            // Step 1: Store in IPFS
            setCurrentStep('Storing project data in IPFS...');
            const ipfsResponse = await fetch('/api/ipfs/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const { ipfsHash } = await ipfsResponse.json();

            // Step 2: Store in Bitcoin
            setCurrentStep('Recording on Bitcoin network...');
            const bitcoinResponse = await fetch('/api/bitcoin/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipfsHash })
            });
            const { txId } = await bitcoinResponse.json();

            // Step 3: Record the project reference
            setCurrentStep('Finalizing project creation...');
            await fetch('/api/projects/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ipfsHash, txId })
            });

            router.push(`/projects/${txId}`);
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="container max-w-3xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter project title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detailed project description"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalBudget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Budget</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Responsible department"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="timeline.start"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="timeline.end"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isPublishing ? (
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
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}