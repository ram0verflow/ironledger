// src/components/layout/main-nav.tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Wallet2Icon, SearchIcon, HomeIcon } from "lucide-react"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            <Button variant="ghost" asChild>
                <Link href="/">
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Home
                </Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/explorer">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Explorer
                </Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/wallet">
                    <Wallet2Icon className="h-4 w-4 mr-2" />
                    Wallet
                </Link>
            </Button>
        </nav>
    )
}

