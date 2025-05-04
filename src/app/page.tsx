import { HydrateClient } from "~/trpc/server";
import { Authentication } from "./_components/Authentication";

export default function Home() {
  return (
    <HydrateClient>
      <Authentication />
    </HydrateClient>
  );
}
