import { HydrateClient } from "~/trpc/server";
import { DashboardSearchbar } from "../_components/Dashboard/DashboardSearchbar";
import { Group, Stack, Image } from "@mantine/core";
import { DashboardGrid } from "../_components/Dashboard/DashboardGrid";

const values = [
    { short_name: "ABC", full_name: "Abidium Cidium", tendency: +20.5 },
    { short_name: "DEF", full_name: "Daebunim Flabius", tendency: -0.6 },
    { short_name: "GHIJ", full_name: "Ghandiam Ijelly", tendency: -0.2 },
    { short_name: "XYZ", full_name: "Xylophone Zentyum", tendency: +28.6 }
];

const items = values.map(item => ({
        key: item.short_name,
        value: item.short_name,
        component: (
            <Group>
                {
                    item.tendency >= 0
                    ? (<Image src="/arrow_green.svg" alt="arrow_green" />)
                    : (<Image src="/arrow_red.svg" alt="arrow_red" />)
                }
                <p className={"font-bold text-transparent bg-clip-text bg-linear-to-b " +
                    (item.tendency < 0 ? "from-[#EA161A] to-[#7F1214]" : "from-[#1AD635] to-[#084811]")}>{item.tendency}</p>
                <p className="font-bold">{item.short_name}</p>
                <p>{item.full_name}</p>
            </Group>
        )
    }
));

export default function Dashboard() {
    return (
        <HydrateClient>
            <Stack
                className="h-full w-full p-[22px]"
                gap="20"
                align="stretch"
            >
                <DashboardSearchbar
                    items={items}
                />
                <DashboardGrid />
            </Stack>
        </HydrateClient>
    );
};