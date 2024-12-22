import { ProjectsAuthProvider } from "@/hooks/use-auth";
import { cookies } from "next/headers";

export default async function ProjectLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userAddress = cookies().get('userAddress')?.value;
    const isGovernment = userAddress === process.env.NEXT_PUBLIC_TESTNET_ADDR;

    return (
        <div>
            <ProjectsAuthProvider isGovernment={isGovernment}>
                {children}
            </ProjectsAuthProvider>
        </div>
    )
}