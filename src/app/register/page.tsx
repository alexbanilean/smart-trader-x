import { HydrateClient } from "~/trpc/server";
import { RegisterComponent } from "../_components/Register";
import { Box } from "@mantine/core";
import { BackgroundImage } from "@mantine/core";

export default function Register() {
  return (
    <HydrateClient>
      <Box h="100vh" w="100vw">
        <BackgroundImage src="/home_bckg.svg" h="100%" w="100%">
          <RegisterComponent />
        </BackgroundImage>
      </Box>
    </HydrateClient>
  );
}
