"use client";

import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import {
  Center,
  Group,
  Paper,
  Stack,
  Text,
  Image,
  PasswordInput,
  TextInput,
  Checkbox,
  Anchor,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const SignInComponent = () => {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z
      .string()
      .min(4, { message: "Password should have at least 4 letters" }),
    rememberMe: z.boolean().default(false),
  });

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: zodResolver(schema),
  });

  const handleSubmit = async (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setLoading(true);
    const { hasErrors } = form.validate();

    if (hasErrors) {
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        rememberMe: Boolean(values.rememberMe),
        redirect: false,
      });

      if (result?.error) {
        // Handle error (you might want to show an error message to the user)
        console.error("Sign in failed:", result.error);
      } else {
        // Successful sign in
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session.status, router]);

  return (
    <Center h="100%" w="100%">
      <Paper shadow="xs" p="xl" w="600px" h="600px" radius="8px" bg="#394867BB">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={loading} />

          <Stack opacity="1">
            <Group
              justify="center"
              className="text-shadow-nav h-[128px] py-(--mantine-spacing-md) text-xl"
              onClick={() => router.push("/")}
              style={{ cursor: "pointer" }}
            >
              <Image src="/logo.svg" alt="logo" />
              <Text c="white" fw="600" fz="h3" ff="montserrat" opacity="1">
                SmartTraderX
              </Text>
            </Group>

            <Stack gap="32px" mx="32px">
              <TextInput
                variant="filled"
                size="md"
                placeholder="Enter email"
                label="Email"
                labelProps={{
                  c: "white",
                  fw: "500",
                  fz: "16",
                  ff: "montserrat",
                  opacity: "1",
                  mb: "12px",
                  ms: "4px",
                }}
                color="#212A3E"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                variant="filled"
                size="md"
                placeholder="Enter password"
                label="Password"
                labelProps={{
                  c: "white",
                  fw: "500",
                  fz: "16",
                  ff: "montserrat",
                  opacity: "1",
                  mb: "12px",
                  ms: "4px",
                }}
                color="#212A3E"
                {...form.getInputProps("password")}
              />
            </Stack>

            <Group justify="space-around" mx="48px" mt="32px">
              <Checkbox
                size="md"
                color="#212A3E"
                iconColor="white"
                label={
                  <Text c="white" fw="500" fz="16" ff="montserrat">
                    Remember me
                  </Text>
                }
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Anchor
                href="/forgot-password"
                c="white"
                fw="500"
                fz="16"
                ff="montserrat"
                fs="underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/forgot-password");
                }}
              >
                Forgot password?
              </Anchor>
            </Group>

            <Group justify="space-around" mx="48px" mt="32px">
              <Button color="#212A3E" radius="md" size="lg" type="submit">
                <Text c="white" fw="500" fz="16" ff="montserrat">
                  Sign In
                </Text>
              </Button>
              <Button
                radius="md"
                size="lg"
                variant="outline"
                bg="#D9D9D9"
                color="#212A3E"
                onClick={() => router.push("/register")}
              >
                <Text fw="500" fz="16" ff="montserrat">
                  Register
                </Text>
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};
