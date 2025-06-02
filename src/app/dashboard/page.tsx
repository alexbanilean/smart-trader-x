"use client"

import { DashboardSearchbar } from "../_components/Dashboard/DashboardSearchbar";
import { DashboardGrid } from "../_components/Dashboard/DashboardGrid";
import { Stack } from "@mantine/core";
import { api } from "~/trpc/react";
import { useState } from "react";
import { DashboardModal } from "../_components/Dashboard/DashboardModal";

export default function Dashboard() {
    const utils = api.useUtils();
    const [searchItems, setSearchItems] = useState<{ id: string, shortName: string, fullName: string, tendency: number }[]>([]);
    const [modalMarket, setModalMarket] = useState<{ id: string, shortName: string, fullName: string, tendency: number, marketData: { date: Date, value: number }[] } | null>(null);
    const [markets, setMarkets] = useState<string[]>([]);

    const onUpdateSearchPrefix = async (prefix: string) => {
        const newSearchItems = prefix === "" ? [] : await utils.market.searchByPrefix.fetch({prefix: prefix});
        setSearchItems(newSearchItems);
    };

    const onUpdateModalMarket = async (marketId: string) => {
        const newMarket = await utils.market.getById.fetch({ id: marketId });
        setModalMarket(newMarket);
    }

    return (
        <Stack
            className="h-full w-full p-[22px] relative"
            gap="20"
            align="stretch"
        >
            <DashboardSearchbar
                items={searchItems}
                onUpdateItems={onUpdateSearchPrefix}
                onSelectedItem={onUpdateModalMarket}
            />
            <DashboardGrid
                onUpdateMarkets={setMarkets}
                onOpenMarket={onUpdateModalMarket}
            />
            <DashboardModal
                market={modalMarket}
                inDashboard={markets.some(market => market === modalMarket?.id)}
                onClose={() => setModalMarket(null)}
            />
        </Stack>
    );
};