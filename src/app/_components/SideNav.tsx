"use client";

import { Group, Image, Stack, Text } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const SideNav: React.FC = () => {
  const session = useSession();
  const router = useRouter();
  const [hasSideNav, setSideNav] = useState(false);
  const [menuLocation, setMenuLocation] = useState("");

  const menuItems = [
    {
      path: "",
      href: "/",
      img_path: "/home.svg",
      img_alt: "home",
      name: "Home",
    },
    {
      path: "dashboard",
      href: "/dashboard",
      img_path: "/dashboard.svg",
      img_alt: "dashboard",
      name: "Dashboard",
    },
    {
      path: "assistant",
      href: "/assistant",
      img_path: "/assistant.svg",
      img_alt: "assistant",
      name: "AI Assistant",
    },
    {
      path: "social-feed",
      href: "/social-feed",
      img_path: "/social.svg",
      img_alt: "social",
      name: "Social Feed",
    },
    {
      path: "profile",
      href: "/profile",
      img_path: "/profile.svg",
      img_alt: "profile",
      name: "Profile",
    },
  ];

  const menuLinks = menuItems.map((item, _index, _array) => {
    let className =
      "flex flex-row items-center gap-2 hover:bg-[#F1F6F980] hover:rounded-[8px]";
    if (item.path === menuLocation) {
      className += " bg-[#F1F6F980] rounded-[8px]";
    }
    return (
      <Link className={className} href={item.href} key={item.name}>
        <Image src={item.img_path} alt={item.img_alt} />
        <span>{item.name}</span>
      </Link>
    );
  });

  useEffect(() => {
    let oldPath = document.location.pathname;
    const body = document.querySelector("body");
    setSideNav(oldPath != "/");
    setMenuLocation(oldPath.split("/")[1] ?? "");

    const observer = new MutationObserver((_) => {
      if (oldPath != window.location.pathname) {
        oldPath = window.location.pathname;
        setSideNav(oldPath != "/");
        setMenuLocation(oldPath.split("/")[1] ?? "");
      }
    });

    observer.observe(body!, { childList: true, subtree: true });
  }, []);
  if (
    hasSideNav &&
    menuItems.find((value, _index, _array) => value.path === menuLocation)
  ) {
    return (
      <div className="text-nav">
        <Stack className="h-full w-[240px] bg-[#9BA4B5] font-bold" gap="0px">
          <Group
            className="text-shadow-nav h-[128px] bg-[#FFFFFF40] py-(--mantine-spacing-md) text-xl"
            justify="center"
            onClick={() =>
              session.status !== "authenticated"
                ? router.push("/signin")
                : router.push("/")
            }
            style={{ cursor: "pointer" }}
          >
            <Image src="/logo.svg" alt="logo" />
            <Text c="#394867" fw="600" fz="h4">
              SmartTraderX
            </Text>
          </Group>
          <div className="h-full bg-[#F1F6F980]">
            <Stack className="px-[24px] pt-[28px] text-sm" gap="24px">
              {menuLinks}
              <Link
                className="flex flex-row items-center gap-2 hover:rounded-[8px] hover:bg-[#F1F6F980]"
                onClick={() =>
                  void signOut({ redirect: true, callbackUrl: "/" })
                }
                href="/"
              >
                <Image src="/sign_out.svg" alt="sign out" />
                <span>Sign out</span>
              </Link>
            </Stack>
          </div>
        </Stack>
      </div>
    );
  } else {
    return <></>;
  }
};
