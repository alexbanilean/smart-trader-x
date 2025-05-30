"use client";

import React from "react";
import {
  Box,
  Group,
  Image,
  BackgroundImage,
  Center,
  Button,
  Text,
  Stack,
  Title,
  Paper,
} from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const Landing: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  return (
    <Box h="100vh" w="100vw">
      <BackgroundImage src="/home_bckg.svg" h="100%" w="100%">
        <Group justify="space-between" mx="64px">
          <Group
            className="text-shadow-nav h-[128px] py-(--mantine-spacing-md) text-xl"
            justify="center"
            onClick={() =>
              session.status !== "authenticated"
                ? router.push("/signin")
                : router.push("/dashboard")
            }
            style={{ cursor: "pointer" }}
          >
            <Image src="/logo.svg" alt="logo" />
            <Text c="white" fw="600" fz="h3">
              SmartTraderX
            </Text>
          </Group>

          <Group justify="center">
            <Button.Group p="md">
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Home
                </Text>
              </Button>
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Features
                </Text>
              </Button>
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Pricing
                </Text>
              </Button>
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Contact
                </Text>
              </Button>
            </Button.Group>
          </Group>

          <Group justify="center">
            {session.status !== "authenticated" ? (
              <Button bg="none" onClick={() => router.push("/signin")}>
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Sign In
                </Text>
              </Button>
            ) : (
              <Button
                bg="none"
                onClick={() =>
                  void signOut({ redirect: true, callbackUrl: "/" })
                }
              >
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Sign Out
                </Text>
              </Button>
            )}
            <Button
              bg="#394867"
              radius="lg"
              onClick={() =>
                session.status !== "authenticated"
                  ? router.push("/register")
                  : router.push("/dashboard")
              }
            >
              <Text c="white" fw="600" fz="14" ff="montserrat">
                Start Trading
              </Text>
            </Button>
          </Group>
        </Group>

        <Stack justify="center" align="center" gap="xl" h="80vh">
          <Title
            order={1}
            c="white"
            fw="700"
            fz="64"
            maw="900px"
            ff="montserrat"
            ta="center"
          >
            Empower Your Trading with AI-Driven Insights
          </Title>

          <Text
            c="white"
            fw="400"
            fz="24"
            maw="450px"
            ff="montserrat"
            ta="center"
          >
            SmartTraderX leverages advanced AI to optimize your trading
            decisions
          </Text>

          <Button
            bg="#394867"
            radius="lg"
            size="lg"
            mt="50px"
            onClick={() =>
              session.status !== "authenticated"
                ? router.push("/register")
                : router.push("/dashboard")
            }
          >
            <Text c="white" fw="600" fz="16" ff="montserrat">
              Start Trading
            </Text>
          </Button>
        </Stack>
      </BackgroundImage>

      <Center h="100%" w="100%" bg="#F1F6F9">
        <Stack justify="center" align="center" gap="xl">
          <Title
            order={1}
            c="#212A3E"
            fw="700"
            fz="64"
            maw="900px"
            ff="montserrat"
            ta="center"
          >
            What awaits you?
          </Title>

          <Group justify="center" gap="md" mt="80px">
            <Paper shadow="xs" p="xl" radius="lg" w="360px" h="360px">
              <Stack>
                <Group>
                  <Image src="/searchicon.svg" alt="search" />

                  <Title
                    order={2}
                    c="#212A3E"
                    fw="600"
                    fz="24"
                    maw="200px"
                    ff="montserrat"
                    ta="center"
                  >
                    AI-Powered Analytics
                  </Title>
                </Group>
                <Text
                  c="#394867"
                  fw="400"
                  fz="16"
                  maw="300px"
                  ff="montserrat"
                  ta="justify"
                  mt="20px"
                >
                  Our advanced AI engine continuously analyzes real-time and
                  historical data to provide tailored market predictions and
                  portfolio suggestions. Whether you&apos;re a beginner or pro,
                  SmartTraderX gives you clarity in uncertainty.
                </Text>
              </Stack>
            </Paper>
            <Paper shadow="xs" p="xl" radius="lg" w="360px" h="360px">
              <Stack>
                <Group>
                  <Image src="/graphicon.svg" alt="graph" />

                  <Title
                    order={2}
                    c="#212A3E"
                    fw="600"
                    fz="24"
                    maw="200px"
                    ff="montserrat"
                    ta="center"
                  >
                    Real-Time Market Data
                  </Title>
                </Group>
                <Text
                  c="#394867"
                  fw="400"
                  fz="16"
                  maw="300px"
                  ff="montserrat"
                  ta="justify"
                  mt="20px"
                >
                  Access live financial data from global markets. Customize your
                  feed, receive alerts, and make informed decisions with
                  constantly updated charts, prices, and news — all in one
                  place.
                </Text>
              </Stack>
            </Paper>
            <Paper shadow="xs" p="xl" radius="lg" w="360px" h="360px">
              <Stack>
                <Group>
                  <Image src="/communityicon.svg" alt="community" />

                  <Title
                    order={2}
                    c="#212A3E"
                    fw="600"
                    fz="24"
                    maw="200px"
                    ff="montserrat"
                    ta="center"
                  >
                    Community Insights
                  </Title>
                </Group>
                <Text
                  c="#394867"
                  fw="400"
                  fz="16"
                  maw="300px"
                  ff="montserrat"
                  ta="justify"
                  mt="20px"
                >
                  Join a vibrant community of traders sharing strategies,
                  insights, and success stories. Discover what&apos;s trending,
                  follow expert investors, and collaborate to enhance your
                  financial knowledge.
                </Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Center>

      <Center h="100%" w="100%" bg="#212A3E">
        <Stack justify="center" align="center" gap="xl">
          <Title
            order={1}
            c="#F1F6F9"
            fw="700"
            fz="56"
            maw="900px"
            ff="montserrat"
            ta="center"
            mt="48px"
          >
            Testimonials
          </Title>

          <Stack gap="24px" mt="24px">
            <Box pos="relative">
              <Paper
                shadow="xs"
                p="xl"
                w="1100px"
                h="120px"
                radius="50px"
                bg="#D9D9D9"
                pos="absolute"
                top="50%"
                left="50%"
                style={{ transform: "translate(-50%, -50%)" }}
              />
              <Group
                gap="50px"
                justify="center"
                pos="relative"
                style={{ zIndex: 1 }}
              >
                <Image src="/testimonial1.svg" alt="testimonial" />

                <Stack maw="700px" gap="10px">
                  <Text
                    c="#394867"
                    fw="400"
                    fz="18"
                    ff="montserrat"
                    ta="justify"
                    fs="italic"
                  >
                    SmartTraderX completely transformed how I approach the
                    market. The AI predictions are scarily accurate!
                  </Text>
                  <Text c="#212A3E" fw="600" fz="18" ff="montserrat">
                    Kelly Adams, Independent Investor
                  </Text>
                </Stack>
              </Group>
            </Box>

            <Box pos="relative">
              <Paper
                shadow="xs"
                p="xl"
                w="1100px"
                h="120px"
                radius="50px"
                bg="#D9D9D9"
                pos="absolute"
                top="50%"
                left="50%"
                style={{ transform: "translate(-50%, -50%)" }}
              />
              <Group
                gap="50px"
                justify="center"
                pos="relative"
                style={{ zIndex: 1 }}
              >
                <Image src="/testimonial2.svg" alt="testimonial" />

                <Stack maw="700px" gap="10px">
                  <Text
                    c="#394867"
                    fw="400"
                    fz="18"
                    ff="montserrat"
                    ta="justify"
                    fs="italic"
                  >
                    Being able to discuss strategies and see others&apos; ideas
                    in the Social Feed is a game changer.
                  </Text>
                  <Text c="#212A3E" fw="600" fz="18" ff="montserrat">
                    The Guardian, Tech Analyst
                  </Text>
                </Stack>
              </Group>
            </Box>

            <Box pos="relative">
              <Paper
                shadow="xs"
                p="xl"
                w="1100px"
                h="120px"
                radius="50px"
                bg="#D9D9D9"
                pos="absolute"
                top="50%"
                left="50%"
                style={{ transform: "translate(-50%, -50%)" }}
              />
              <Group
                gap="50px"
                justify="center"
                pos="relative"
                style={{ zIndex: 1 }}
              >
                <Image src="/testimonial3.svg" alt="testimonial" />

                <Stack maw="700px" gap="10px">
                  <Text
                    c="#394867"
                    fw="400"
                    fz="18"
                    ff="montserrat"
                    ta="justify"
                    fs="italic"
                  >
                    The simplicity, power, and personalization in this platform
                    make it perfect for my daily trades.
                  </Text>
                  <Text c="#212A3E" fw="600" fz="18" ff="montserrat">
                    Ravi P., Professional Trader
                  </Text>
                </Stack>
              </Group>
            </Box>
          </Stack>
        </Stack>
      </Center>

      <Center h="10%" w="100%" bg="black">
        <Group justify="space-between" w="100%" mx="64px">
          <Group justify="center">
            <Image src="/logo.svg" alt="logo" />
            <Text c="white" fw="500" fz="16" ff="montserrat" ta="center">
              © 2025 SmartTraderX
            </Text>
          </Group>

          <Group justify="center">
            <Button.Group p="md">
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Features
                </Text>
              </Button>
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Pricing
                </Text>
              </Button>
              <Button bg="#394867" radius="md" size="md">
                <Text c="white" fw="500" fz="14" ff="montserrat" ta="center">
                  Contact
                </Text>
              </Button>
            </Button.Group>
          </Group>

          <Group justify="center">
            <Button.Group>
              <Button bg="none" h="64px" w="64px">
                <Image src="/linkedinicon.svg" alt="linkedin" />
              </Button>
              <Button bg="none" h="64px" w="64px">
                <Image src="/discordicon.svg" alt="discord" />
              </Button>
              <Button bg="none" h="64px" w="64px">
                <Image src="/xicon.svg" alt="x" />
              </Button>
            </Button.Group>
          </Group>
        </Group>
      </Center>
    </Box>
  );
};
