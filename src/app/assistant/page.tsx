import { HydrateClient } from "~/trpc/server";
import { AiAssistant } from "../_components/AiAssistant";

export default function Assistant() {
  return (
    <HydrateClient>
      <AiAssistant />
    </HydrateClient>
  );
}
