"use client"

import { Container, Group, Image, Stack } from "@mantine/core";
import { type DragEventHandler, useEffect, useRef, useState } from "react";
import { DashboardChart } from "./DashboardChart";
import { api } from "~/trpc/react";

type GridItem = { id: string, shortName: string, tendency: number, marketData: { date: Date, value: number }[] };
type DashboardGridProps = { onUpdateMarkets: (markets: string[]) => void, onOpenMarket: (marketId: string) => void };

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onUpdateMarkets, onOpenMarket }) => {
    const utils = api.useUtils();
    const grid = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState(0);
    const { data: markets } = api.market.getDashboard.useQuery();
    const [procItems, setProcItems] = useState<GridItem[]>([]);

    useEffect(() => {
        if (markets) {
            setProcItems(markets.map(market => market.market));
            onUpdateMarkets(markets.map(market => market.market.id));
        }
    }, [markets, onUpdateMarkets]);

    const updateDashboard = api.market.updateMarketsInDashboard.useMutation({
        onSuccess: async () => {
            await utils.market.getDashboard.invalidate();
        }
    });

    const dragStartEvent: DragEventHandler<HTMLDivElement> = (event) => {
        if (grid.current === null) { return; }

        const gridX = grid.current.getBoundingClientRect().left;
        const gridY = grid.current.getBoundingClientRect().top - grid.current.scrollTop;

        const gridWidth = grid.current.offsetWidth;
        const gridHeight = grid.current.scrollHeight;

        const boxWidth = event.currentTarget.offsetWidth;
        const boxHeight = event.currentTarget.offsetHeight;

        const gridSizeX = Math.round((gridWidth + 16.0) / (boxWidth + 16.0));
        const gridSizeY = Math.round((gridHeight + 16.0) / (boxHeight + 16.0));
        const lastSizeX = grid.current.children.length % gridSizeX;
        const lastGap = lastSizeX > 1 ? Math.round((gridWidth - lastSizeX * boxWidth) / (lastSizeX - 1)) : 0;

        const boxCenterX = event.currentTarget.offsetLeft + boxWidth / 2.0;
        const boxCenterY = event.currentTarget.offsetTop - grid.current.scrollTop + boxHeight / 2.0;

        const boxIndexY = Math.floor((boxCenterY - gridY + 16.0) / (boxHeight + 16.0));
        const boxIndexX = (
            boxIndexY == gridSizeY - 1 ?
            (lastSizeX == 1 ? 0 : Math.floor((boxCenterX - gridX + lastGap) / (boxWidth + lastGap))) :
            Math.floor((boxCenterX - gridX + 16.0) / (boxWidth + 16.0))
        );
        const index = boxIndexY * gridSizeX + boxIndexX;
        setDraggingIndex(index);
    };

    const dragEvent: DragEventHandler<HTMLDivElement> = (event) => {
        if (grid.current === null) { return; }

        const gridX = grid.current.getBoundingClientRect().left;
        const gridY = grid.current.getBoundingClientRect().top - grid.current.scrollTop;

        const gridWidth = grid.current.offsetWidth;
        const gridHeight = grid.current.scrollHeight;

        if (event.clientX < gridX || event.clientX >= gridX + gridWidth || event.clientY < gridY || event.clientY >= gridY + gridHeight) {
            return
        }

        const boxWidth = event.currentTarget.offsetWidth;
        const boxHeight = event.currentTarget.offsetHeight;

        const gridSizeX = Math.round((gridWidth + 16.0) / (boxWidth + 16.0));
        const gridSizeY = Math.round((gridHeight + 16.0) / (boxHeight + 16.0));
        const lastSizeX = grid.current.children.length % gridSizeX;
        const lastGap = lastSizeX > 1 ? Math.round((gridWidth - lastSizeX * boxWidth) / (lastSizeX - 1)) : 0;

        const cursorIndexY = Math.floor((event.clientY - gridY + 16.0) / (boxHeight + 16.0));
        const cursorIndexX = (
            cursorIndexY == gridSizeY - 1 ?
            (lastSizeX == 1 ? 0 : Math.floor((event.clientX - gridX + lastGap) / (boxWidth + lastGap))) :
            Math.floor((event.clientX - gridX + 16.0) / (boxWidth + 16.0))
        );

        const index = cursorIndexY * gridSizeX + cursorIndexX;
        if (index != draggingIndex) {
            const newItems = procItems.slice(0);
            const indexValue = newItems[draggingIndex]!;
            newItems.splice(draggingIndex, 1);
            newItems.splice(index, 0, indexValue);
            setProcItems(newItems);
            onUpdateMarkets(newItems.map(item => item.id));
            setDraggingIndex(index);
        }
    };

    return <Group
        className="p-auto overflow-y-scroll no-scrollbar"
        ref={grid}
        justify="space-around"
        gap="16px"
    >
        {procItems.map((item, index) => (
            <Container
                key={index}
                className="relative p-0! bg-[#9BA4B5] rounded-[25px] m-0!"
            >
                <Group
                    className="bg-[#F1F6F980] p-[20px] border-2! border-transparent! hover:border-[#394867]! hover:cursor-pointer! rounded-[25px]"
                    align="center"
                    onClick={() => onOpenMarket(item.id)}
                >
                    <Stack
                        align="center"
                        className="w-[150px] text-4xl"
                    >
                        <p>{item.shortName}</p>
                        <Group
                            className={ "p-[10px] rounded-[8px] text-3xl border-2! border-[#212A3E] text-white bg-linear-to-b " + (
                                item.tendency < 0 ?
                                "from-[#EA161A] to-[#7F1214]" :
                                "from-[#1AD635] to-[#084811]"
                            )}
                        >
                            <Image
                                src={item.tendency < 0 ? "/arrow_down.svg" : "/arrow_up.svg"}
                                alt="tendency"
                            />
                            <p>{item.tendency}</p>
                        </Group>
                    </Stack>
                    <DashboardChart
                        isPositive={item.tendency >= 0}
                        width={300}
                        height={175}
                        data={item.marketData}
                    />
                </Group>
                <Image
                    src="/drag.svg"
                    alt="drag"
                    draggable="true"
                    onDragStart={(event) => {
                        const parent = event.currentTarget.parentElement as HTMLDivElement;
                        dragStartEvent({...event, currentTarget: parent});
                    }}
                    onDrag={(event) => {
                        const parent = event.currentTarget.parentElement as HTMLDivElement;
                        dragEvent({...event, currentTarget: parent});
                    }}
                    onDragEnd={() => updateDashboard.mutate(procItems.map(market => market.id))}
                    className="absolute top-[10px] left-[10px] h-[24px]! w-[24px]! hover:cursor-grab active:cursor-grabbing object-none!"
                />
            </Container>
        ))}
    </Group>
};