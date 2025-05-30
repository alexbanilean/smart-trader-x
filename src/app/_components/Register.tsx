"use client";

import { api } from "~/trpc/react";
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
  Button,
  LoadingOverlay,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const RegisterComponent = () => {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const doRegisterUser = api.user.register.useMutation();

  const schema = z
    .object({
      name: z
        .string()
        .min(2, { message: "Name should have at least 2 letters" }),
      email: z.string().email({ message: "Invalid email" }),
      password: z
        .string()
        .min(4, { message: "Password should have at least 4 letters" }),
      confirmPassword: z
        .string()
        .min(4, { message: "Password should have at least 4 letters" }),
      termsOfService: z.boolean(),
    })
    .superRefine(({ confirmPassword, password, termsOfService }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "The passwords did not match",
          path: ["confirmPassword"],
        });
      }

      if (!termsOfService) {
        ctx.addIssue({
          code: "custom",
          message: "You must agree with terms of service",
          path: ["termsOfService"],
        });
      }
    });

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsOfService: false,
    },
    validate: zodResolver(schema),
  });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsOfService: boolean;
  }) => {
    setLoading(true);
    const { hasErrors } = form.validate();

    if (hasErrors) {
      setLoading(false);
      return;
    }

    try {
      doRegisterUser.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      router.push("/signin");
    } catch (error) {
      console.error("Registration error:", error);
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
      <Paper shadow="xs" p="xl" w="600px" h="800px" radius="8px" bg="#394867BB">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={loading} />

          <Stack opacity="1" gap="4px">
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

            <Stack mx="32px" gap="16px">
              <TextInput
                variant="filled"
                size="md"
                placeholder="Enter your name"
                label="Name"
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
                {...form.getInputProps("name")}
              />
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
              <PasswordInput
                variant="filled"
                size="md"
                placeholder="Confirm password"
                label="Confirm Password"
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
                {...form.getInputProps("confirmPassword")}
              />
            </Stack>

            <Group justify="center" mx="48px" mt="32px">
              <Checkbox
                size="md"
                color="#212A3E"
                iconColor="white"
                label={
                  <Text c="white" fw="500" fz="16" ff="montserrat">
                    I agree with terms and conditions
                  </Text>
                }
                {...form.getInputProps("termsOfService", { type: "checkbox" })}
              />
            </Group>

            <Group justify="space-around" mx="48px" mt="32px">
              <Button color="#212A3E" radius="md" size="lg" type="submit">
                <Text c="white" fw="500" fz="16" ff="montserrat">
                  Register
                </Text>
              </Button>
              <Button
                radius="md"
                size="lg"
                variant="outline"
                bg="#D9D9D9"
                color="#212A3E"
                onClick={() => router.push("/signin")}
              >
                <Text fw="500" fz="16" ff="montserrat">
                  Sign In
                </Text>
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};
