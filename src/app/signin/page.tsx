import { HydrateClient } from "~/trpc/server";
import { SignInComponent } from "../_components/SignIn";
import { Box } from "@mantine/core";
import { BackgroundImage } from "@mantine/core";

export default function SignIn() {
  return (
    <HydrateClient>
      <Box h="100vh" w="100vw">
        <BackgroundImage src="/home_bckg.svg" h="100%" w="100%">
          <SignInComponent />
        </BackgroundImage>
      </Box>
    </HydrateClient>
  );
}
