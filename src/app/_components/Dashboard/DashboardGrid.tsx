"use client"

import { Group } from "@mantine/core";
import { type DragEventHandler, useRef, useState } from "react";

export const DashboardGrid: React.FC = () => {
    const grid = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState(0);
    const [boxIndices, setBoxIndices] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

    const dragStartEvent: DragEventHandler<HTMLDivElement> = (event) => {
        const gridX = grid.current!.offsetLeft;
        const gridY = grid.current!.offsetTop;

        const gridWidth = grid.current!.offsetWidth;
        const gridHeight = grid.current!.offsetHeight;

        const boxWidth = event.currentTarget.offsetWidth;
        const boxHeight = event.currentTarget.offsetHeight;

        const gridSizeX = Math.round((gridWidth + 16.0) / (boxWidth + 16.0));
        const gridSizeY = Math.round((gridHeight + 16.0) / (boxHeight + 16.0));
        const lastSizeX = grid.current!.children.length % gridSizeX;
        const lastGap = lastSizeX > 1 ? Math.round((gridWidth - lastSizeX * boxWidth) / (lastSizeX - 1)) : 0

        const boxCenterX = event.currentTarget.offsetLeft + boxWidth / 2.0;
        const boxCenterY = event.currentTarget.offsetTop + boxHeight / 2.0;

        const boxIndexY = Math.floor((boxCenterY - gridY + 16.0) / (boxHeight + 16.0));
        const boxIndexX = (
            boxIndexY == gridSizeY - 1 ?
            Math.floor((boxCenterX - gridX + lastGap) / (boxWidth + lastGap)) :
            Math.floor((boxCenterX - gridX + 16.0) / (boxWidth + 16.0))
        );
        const index = boxIndexY * gridSizeX + boxIndexX;
        setDraggingIndex(index);
    };

    const dragEvent: DragEventHandler<HTMLDivElement> = (event) => {
        const gridX = grid.current!.offsetLeft;
        const gridY = grid.current!.offsetTop;

        const gridWidth = grid.current!.offsetWidth;
        const gridHeight = grid.current!.offsetHeight;

        if (event.clientX < gridX || event.clientX >= gridX + gridWidth || event.clientY < gridY || event.clientY >= gridY + gridHeight) {
            return
        }

        const boxWidth = event.currentTarget.offsetWidth;
        const boxHeight = event.currentTarget.offsetHeight;

        const gridSizeX = Math.round((gridWidth + 16.0) / (boxWidth + 16.0));
        const gridSizeY = Math.round((gridHeight + 16.0) / (boxHeight + 16.0));
        const lastSizeX = grid.current!.children.length % gridSizeX;
        const lastGap = lastSizeX > 1 ? Math.round((gridWidth - lastSizeX * boxWidth) / (lastSizeX - 1)) : 0

        const cursorIndexY = Math.floor((event.clientY - gridY + 16.0) / (boxHeight + 16.0));
        const cursorIndexX = (
            cursorIndexY == gridSizeY - 1 ?
            Math.floor((event.clientX - gridX + lastGap) / (boxWidth + lastGap)) :
            Math.floor((event.clientX - gridX + 16.0) / (boxWidth + 16.0))
        );
        const index = cursorIndexY * gridSizeX + cursorIndexX;
        if (index != draggingIndex) {
            const newBoxIndices = boxIndices.slice(0);
            const indexValue = newBoxIndices[draggingIndex]!;
            newBoxIndices.splice(draggingIndex, 1);
            newBoxIndices.splice(index, 0, indexValue);
            setBoxIndices(newBoxIndices);
            setDraggingIndex(index);
        }
    };

    return <Group
        className="p-auto"
        ref={grid}
        justify="space-between"
        gap="16px"
    >
        {boxIndices.map(index => (
            <div
            draggable="true"
            className="h-[40px] w-[40px] hover:cursor-grab active:cursor-grabbing"
            onDragStart={dragStartEvent}
            onDrag={dragEvent}
            key={index}
            >
                {index}
            </div>
        ))}
    </Group>
};