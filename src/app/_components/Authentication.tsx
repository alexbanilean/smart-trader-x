"use client";

import React, { useState } from "react";
import {
  Modal,
  Title,
  Paper,
  LoadingOverlay,
  Group,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Button,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconAt, IconLock } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { api } from "~/trpc/react";
import { signIn, signOut, useSession } from "next-auth/react";

type AuthenticationFormProps = {
  onClose: () => void;
};

export const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  onClose,
}) => {
  const session = useSession();
  const [formType, setFormType] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const doRegisterUser = api.user.register.useMutation();

  const toggleFormType = () => {
    setFormType((current) => (current === "register" ? "login" : "register"));
    form.reset();
  };

  const schema = z
    .object(
      formType === "register"
        ? {
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
          }
        : {
            email: z.string().email({ message: "Invalid email" }),
            password: z
              .string()
              .min(4, { message: "Password should have at least 4 letters" }),
          },
    )
    .superRefine(({ confirmPassword, password, termsOfService }, ctx) => {
      if (formType === "register") {
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

  const handleSubmit = (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsOfService: boolean;
  }) => {
    console.log("handleSubmit");
    setLoading(true);
    const { hasErrors } = form.validate();

    if (hasErrors) {
      setLoading(false);
      return;
    }

    if (formType === "register") {
      doRegisterUser.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } else {
      void (async () => {
        try {
          await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirectTo: "/products",
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }

    setLoading(false);
    onClose();
  };

  return (
    <Paper p="lg" shadow="lg" withBorder>
      {session.status === "authenticated" ? (
        <Flex align="center" justify="space-between">
          <Title order={4}>You are already authenticated</Title>
          <Button
            variant="outline"
            color="red"
            onClick={() => void signOut({ redirectTo: "/" })}
          >
            Logout
          </Button>
        </Flex>
      ) : (
        <form
          onSubmit={form.onSubmit(
            (values) => {
              handleSubmit(values);
            },
            (validationErrors, values, event) => {
              console.log(
                validationErrors, // <- form.errors at the moment of submit
                values, // <- form.getValues() at the moment of submit
                event, // <- form element submit event
              );
            },
          )}
        >
          <LoadingOverlay visible={loading} />
          {formType === "register" && (
            <TextInput
              data-autofocus
              required
              placeholder="Your name"
              label="Name"
              {...form.getInputProps("name")}
            />
          )}

          <TextInput
            mt="md"
            required
            placeholder="Your email"
            label="Email"
            leftSection={<IconAt size={16} stroke={1.5} />}
            {...form.getInputProps("email")}
          />

          <PasswordInput
            mt="md"
            required
            placeholder="Password"
            label="Password"
            leftSection={<IconLock size={16} stroke={1.5} />}
            {...form.getInputProps("password")}
          />

          {formType === "register" && (
            <PasswordInput
              mt="md"
              required
              label="Confirm Password"
              placeholder="Confirm password"
              leftSection={<IconLock size={16} stroke={1.5} />}
              {...form.getInputProps("confirmPassword")}
            />
          )}

          {formType === "register" && (
            <Checkbox
              mt="xl"
              label="I agree with terms and conditions"
              {...form.getInputProps("termsOfService", { type: "checkbox" })}
            />
          )}

          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={toggleFormType}
              size="sm"
            >
              {formType === "register"
                ? "Have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>

            <Button type="submit">
              {formType === "register" ? "Register" : "Login"}
            </Button>
          </Group>
        </form>
      )}
    </Paper>
  );
};

export const Authentication: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Authentication"
        size="lg"
        centered
        styles={{
          title: {
            fontWeight: 600,
          },
        }}
      >
        <AuthenticationForm onClose={close} />
      </Modal>

      <Button color="white" variant="subtle" size="6rem" onClick={open}>
        <Title size="4rem">Smart Trader X</Title>
      </Button>
    </>
  );
};
