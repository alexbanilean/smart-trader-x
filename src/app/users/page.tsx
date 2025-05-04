import { HydrateClient } from "~/trpc/server";
import { UserManagement } from "../_components/UserManagement";

export default function Users() {
  return (
    <HydrateClient>
      <UserManagement />
    </HydrateClient>
  );
}
