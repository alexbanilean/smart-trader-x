"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Group,
  Avatar,
  Text,
  TextInput,
  Select,
  Button,
  ActionIcon,
  Container,
  Grid,
  Menu,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconMail,
  IconMenu2,
  IconUpload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { api } from "~/trpc/react";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "ro", label: "Romania" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ro", label: "Romanian" },
];

const timezoneOptions = [
  { value: "utc", label: "UTC" },
  { value: "est", label: "Eastern Time" },
  { value: "cst", label: "Central Time" },
  { value: "ro", label: "Romanian Time" },
];

const assetOptions = [
  { value: "stocks", label: "Stocks" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "forex", label: "Forex" },
  { value: "commodities", label: "Commodities" },
];

const riskToleranceOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const tradingFrequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "occasionally", label: "Occasionally" },
];

const experienceLevelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const utils = api.useUtils();
  const { data: user } = api.user.getProfile.useQuery();

  const form = useForm({
    initialValues: {
      fullName: user?.name ?? "",
      nickName: "",
      gender: "",
      country: "",
      language: "",
      timeZone: "",
      preferredAsset: "",
      riskTolerance: "",
      tradingFrequency: "",
      experienceLevel: "",
      emails: [user?.email ?? ""],
    },
  });

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.user.getProfile.invalidate();
    },
  });

  const uploadPhoto = api.user.uploadProfilePhoto.useMutation({
    onSuccess: async (data) => {
      setPreview(data.url);
      await utils.user.getProfile.invalidate();
    },
  });

  const deletePhoto = api.user.deleteProfilePhoto.useMutation({
    onSuccess: async () => {
      setPreview(null);
      await utils.user.getProfile.invalidate();
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/signin");
    }
  }, [session.status, router]);

  useEffect(() => {
    if (user) {
      form.setValues({
        fullName: user.name ?? "",
        nickName: user.nickName ?? "",
        gender: user.gender ?? "",
        country: user.country ?? "",
        language: user.language ?? "",
        timeZone: user.timeZone ?? "",
        preferredAsset: user.preferredAsset ?? "",
        riskTolerance: user.riskTolerance ?? "",
        tradingFrequency: user.tradingFrequency ?? "",
        experienceLevel: user.experienceLevel ?? "",
        emails: [user.email],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = (values: typeof form.values) => {
    // Always keep the first email, filter out empty/undefined others
    const filteredEmails: string[] = [
      values.emails[0]!, // always keep the first (main) email
      ...values.emails
        .slice(1)
        .filter((email): email is string => !!email && email.trim() !== ""),
    ];
    form.setFieldValue("emails", filteredEmails);
    updateProfile.mutate({ ...values, emails: filteredEmails });
  };

  const addEmail = () => {
    form.setFieldValue("emails", [...form.values.emails, ""]);
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        uploadPhoto.mutate({ file: base64, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const hasPhoto = Boolean(user?.image ?? preview);

  if (session.status === "loading") {
    return null;
  }

  return (
    <Container size="xl" py="xl" style={{ minHeight: "100vh" }} mt="48px">
      <Paper
        shadow="md"
        p={40}
        radius={24}
        style={{
          background:
            "linear-gradient(0deg, rgba(241,246,249,0.75), rgba(241,246,249,0.75)), #9BA4B5",
          maxWidth: 1000,
          margin: "40px auto",
          borderRadius: 24,
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={32}>
            <Group align="flex-start" justify="space-between" wrap="nowrap">
              <Group align="center" gap={32}>
                <Box style={{ position: "relative" }}>
                  <Avatar
                    size={110}
                    radius={999}
                    src={preview ?? user?.image}
                    style={{ border: "5px solid #394867" }}
                  />
                  <Menu shadow="md" width={200} position="bottom-end" withArrow>
                    <Menu.Target>
                      <ActionIcon
                        variant="filled"
                        color="#E3EAF3"
                        size={36}
                        radius={999}
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: -8,
                          border: "2px solid #394867",
                          background: "#fff",
                          boxShadow: "0 2px 8px #39486722",
                        }}
                      >
                        <IconMenu2 size={20} color="#394867" />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconUpload size={16} />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {hasPhoto ? "Upload new photo" : "Upload profile photo"}
                      </Menu.Item>
                      {hasPhoto && (
                        <>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => {
                              deletePhoto.mutate();
                            }}
                          >
                            Delete photo
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Box>
                <Stack gap={0} justify="center" style={{ minWidth: 220 }}>
                  <Text size="xl" fw={700} c="#212A3E">
                    {user?.name ?? "John Doe"}
                  </Text>
                  <Text size="md" c="#6B7280">
                    {user?.email ?? "johndoe@gmail.com"}
                  </Text>
                </Stack>
              </Group>
              <Button
                type="submit"
                size="md"
                radius="md"
                style={{
                  background: "#394867",
                  fontWeight: 600,
                  minWidth: 100,
                }}
              >
                Edit
              </Button>
            </Group>

            <Group align="flex-start" gap={32} wrap="nowrap">
              <Box style={{ flex: 2 }}>
                <Grid gutter={24}>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Full Name
                    </Text>
                    <TextInput
                      placeholder="Type here..."
                      {...form.getInputProps("fullName")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Nick Name
                    </Text>
                    <TextInput
                      placeholder="Type here..."
                      {...form.getInputProps("nickName")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Gender
                    </Text>
                    <Select
                      placeholder="Select..."
                      data={genderOptions}
                      {...form.getInputProps("gender")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Country
                    </Text>
                    <Select
                      placeholder="Select..."
                      data={countryOptions}
                      {...form.getInputProps("country")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Language
                    </Text>
                    <Select
                      placeholder="Select..."
                      data={languageOptions}
                      {...form.getInputProps("language")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} mb={4}>
                      Time Zone
                    </Text>
                    <Select
                      placeholder="Select..."
                      data={timezoneOptions}
                      {...form.getInputProps("timeZone")}
                      styles={{
                        input: {
                          background: "#A7B4C6",
                          color: "#fff",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Box>
              <Box style={{ flex: 1, minWidth: 220 }}>
                <Text fw={500} mb={8}>
                  Email Addresses
                </Text>
                <Stack gap={8}>
                  {form.values.emails.map((email, idx) => (
                    <Group key={idx} gap={8} align="center">
                      <IconMail size={18} color="#394867" />
                      <TextInput
                        value={email}
                        readOnly={idx === 0}
                        onChange={(e) => {
                          const newEmails = [...form.values.emails];
                          newEmails[idx] = e.target.value;
                          form.setFieldValue("emails", newEmails);
                        }}
                        styles={{
                          input: {
                            background: "#A7B4C6",
                            color: "#fff",
                            fontWeight: 500,
                            border: "none",
                          },
                        }}
                        style={{ flex: 1 }}
                      />
                      {idx > 0 && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            const newEmails = [...form.values.emails];
                            newEmails.splice(idx, 1);
                            form.setFieldValue("emails", newEmails);
                          }}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                  <Button
                    variant="light"
                    leftSection={<IconPlus size={16} />}
                    color="#394867"
                    style={{
                      background: "#A7B4C6",
                      color: "#fff",
                      fontWeight: 500,
                    }}
                    onClick={addEmail}
                    disabled={form.values.emails.length >= 3}
                  >
                    Add email address
                  </Button>
                </Stack>
              </Box>
            </Group>

            <Box mt={16}>
              <Grid gutter={24}>
                <Grid.Col span={6}>
                  <Text fw={500} mb={4}>
                    Preferred Asset
                  </Text>
                  <Select
                    placeholder="Select..."
                    data={assetOptions}
                    {...form.getInputProps("preferredAsset")}
                    styles={{
                      input: {
                        background: "#A7B4C6",
                        color: "#fff",
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500} mb={4}>
                    Risk Tolerance
                  </Text>
                  <Select
                    placeholder="Select..."
                    data={riskToleranceOptions}
                    {...form.getInputProps("riskTolerance")}
                    styles={{
                      input: {
                        background: "#A7B4C6",
                        color: "#fff",
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500} mb={4}>
                    Trading Frequency
                  </Text>
                  <Select
                    placeholder="Select..."
                    data={tradingFrequencyOptions}
                    {...form.getInputProps("tradingFrequency")}
                    styles={{
                      input: {
                        background: "#A7B4C6",
                        color: "#fff",
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500} mb={4}>
                    Experience Level
                  </Text>
                  <Select
                    placeholder="Select..."
                    data={experienceLevelOptions}
                    {...form.getInputProps("experienceLevel")}
                    styles={{
                      input: {
                        background: "#A7B4C6",
                        color: "#fff",
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
