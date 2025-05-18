import { HydrateClient } from "~/trpc/server";

export default function Dashboard() {
    return (
        <HydrateClient>
            <p>Hello</p>
        </HydrateClient>
    );
};