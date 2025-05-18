"use client"

import { Group, Image, Stack } from "@mantine/core";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export const SideNav: React.FC = () => {
    const [hasSideNav, setSideNav] = useState(false);
    const [menuLocation, setMenuLocation] = useState("");

    const menuItems = [
        {path: "", href: "/", img_path: "/home.svg", img_alt: "home", name: "Home"},
        {path: "dashboard", href: "/dashboard", img_path: "/dashboard.svg", img_alt: "dashboard", name: "Dashboard"},
        {path: "assistant", href: "/assistant", img_path: "/assistant.svg", img_alt: "assistant", name: "AI Assistant"},
        {path: "social", href: "/social", img_path: "/social.svg", img_alt: "social", name: "Social Feed"},
        {path: "profile", href: "/profile", img_path: "/profile.svg", img_alt: "profile", name: "Profile"}
    ];

    const menuLinks = menuItems.map((item, _index, _array) => {
        let className = "flex flex-row items-center gap-2 hover:bg-[#F1F6F980] hover:rounded-[8px]";
        if (item.path === menuLocation) {
            className += " bg-[#F1F6F980] rounded-[8px]";
        }
        return <Link
            className={className}
            href={item.href}
            key={item.name}
        >
            <Image src={item.img_path} alt={item.img_alt} /><span>{item.name}</span>
        </Link>;
    });

    useEffect(() => {
        let oldPath = document.location.pathname;
        const body = document.querySelector('body');
        setSideNav(oldPath != "/");
        setMenuLocation(oldPath.split("/")[1] ?? "");

        const observer = new MutationObserver(_ => {
            if (oldPath != window.location.pathname) {
                oldPath = window.location.pathname;
                setSideNav(oldPath != "/");
                setMenuLocation(oldPath.split("/")[1] ?? "");
            }
        });

        observer.observe(body!, { childList: true, subtree: true });
    }, []);
    if (hasSideNav && menuItems.find((value, _index, _array) => value.path === menuLocation)) {
        return (
            <div className="text-nav">
                <Stack
                    className="bg-[#9BA4B5] h-full w-[240px] font-bold"
                    gap="0px"
                >
                    <Group
                        className="bg-[#FFFFFF40] h-[128px] py-(--mantine-spacing-md) text-xl text-shadow-nav"
                        justify="center"
                    >
                            <Image src="/logo.svg" alt="logo"/>
                            <p>SmartTraderX</p>
                    </Group>
                    <div className="bg-[#F1F6F980] h-full">
                        <Stack
                            className="px-[24px] pt-[28px] text-sm"
                            gap="24px"
                        >
                            {menuLinks}
                            <Link
                                className="flex flex-row items-center gap-2 hover:bg-[#F1F6F980] hover:rounded-[8px]"
                                onClick={() => void signOut({ redirect: false })}
                                href="/"
                            >
                                <Image src="/sign_out.svg" alt="sign out" /><span>Sign out</span>
                            </Link>
                        </Stack>
                    </div>
                </Stack>
            </div>
        );
    } else {
        return (
            <></>
        );
    }
};