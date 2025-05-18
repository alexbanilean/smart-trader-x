"use client"

import React, { useState } from "react";
import { Area, AreaChart, ReferenceArea, Tooltip, YAxis } from "recharts";
import { Image } from "@mantine/core";

type ChartProps = { zoomable?: boolean, isPositive: boolean, width: number, height: number, data: { date: Date, value: number }[] };

export const DashboardChart: React.FC<ChartProps> = ({ zoomable = false, isPositive, width, height, data }) => {
    const [interval, setInterval] = useState({left: 0, right: 0, data: data, inProgress: false});

    const zoom = () => {
        if (interval.left === interval.right) {
            setInterval(interval => ({...interval, left: 0, right: 0, inProgress: false}));
            return;
        }
        const [left, right] = interval.left < interval.right ? [interval.left, interval.right] : [interval.right, interval.left];
        setInterval(interval => ({left: 0, right: 0, data: interval.data.slice(left, right + 1), inProgress: false}));
    };

    const zoomOut = () => {
        setInterval({left: 0, right: 0, data: data, inProgress: false});
    }

    return <div className="relative">
        <AreaChart
            width={width}
            height={height}
            data={interval.data}
            onMouseDown={(event) => {
                if (!zoomable) { return; }
                setInterval(interval => ({...interval, left: parseInt(event.activeLabel!), right: parseInt(event.activeLabel!), inProgress: true }));
            }}
            onMouseMove={(event) => {
                if (!zoomable) { return; }
                setInterval(interval => ({...interval, right: parseInt(event.activeLabel!)}))
            }}
            onMouseUp={(event) => {
                if (!zoomable) { return; }
                setInterval(interval => ({...interval, right: parseInt(event.activeLabel!)}));
                zoom();
            }}
        >
            <defs>
                <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1AD635" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#084811" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA161A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7F1214" stopOpacity={0.4} />
                </linearGradient>
            </defs>
            <YAxis dataKey="value" includeHidden={true} stroke="var(--color-main)" className="select-none" width={30} />
            <Tooltip active={false} />
            <Area
                isAnimationActive={zoomable}
                type="linear"
                dot={{stroke: "var(--color-main)", fill: "var(--color-main)", fillOpacity: "0.2", strokeWidth: "1", r: 2}}
                activeDot={true}
                dataKey="value"
                baseValue="dataMin"
                stroke={isPositive ? "#1AD635" : "#EA161A"}
                fillOpacity={1}
                fill={isPositive ? "url(#gradientGreen)" : "url(#gradientRed)"}
            />
            {
                zoomable && interval.inProgress && interval.left !== interval.right ?
                <ReferenceArea
                    yAxisId="0"
                    x1={interval.left}
                    x2={interval.right}
                    strokeOpacity={0.3}
                /> : null
            }
        </AreaChart>
        {
            zoomable && data.length !== interval.data.length ?
            <Image
                src="/zoom_out.svg"
                alt="zoom_out"
                className="absolute top-[10px] right-[10px] object-none! w-[24px]! h-[24px]! hover:cursor-pointer"
                onClick={zoomOut}
            /> :
            null
        }
    </div>;
};