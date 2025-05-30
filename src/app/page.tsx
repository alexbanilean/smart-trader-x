import { HydrateClient } from "~/trpc/server";
import { Landing } from "./_components/Landing";

export default function Home() {
  return (
    <HydrateClient>
      <Landing />
    </HydrateClient>
  );
}
