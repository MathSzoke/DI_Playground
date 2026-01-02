import React, { useState } from "react";
import {
    Card,
    CardHeader,
    Text,
    Badge,
    makeStyles,
    Button,
    InfoLabel
} from "@fluentui/react-components";
import { ZoomInRegular, ZoomOutRegular, ArrowRotateClockwiseRegular } from "@fluentui/react-icons";
import TransientView from "./views/TransientView";
import ScopedView from "./views/ScopedView";
import SingletonView from "./views/SingletonView";

const useStyles = makeStyles({
    card: {
        flex: "1 1 300px",
        height: "450px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
    },
    cardHeader: {
        justifyContent: "space-between",
        display: "flex",
        width: "100%",
        alignItems: "center"
    },
    viewport: {
        flex: 1,
        position: "relative",
        cursor: "grab",
        ":active": { cursor: "grabbing" },
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
        borderRadius: "4px",
        touchAction: "none"
    },
    content: {
        position: "absolute",
        transformOrigin: "0 0",
        transition: "transform 0.1s ease-out",
        pointerEvents: "none"
    },
    controls: {
        position: "absolute",
        bottom: "10px",
        right: "10px",
        display: "flex",
        gap: "4px",
        zIndex: 100
    }
});

export default function DiCard({ title, color, events, infoLabelTxt }) {
    const s = useStyles();
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const relevant = events.filter(e => e.lifetime.startsWith(title));

    const onPointerDown = (e) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const onWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(prev => Math.min(Math.max(0.2, prev + delta), 3));
        }
    };

    const resetView = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    return (
        <Card className={s.card}>
            <CardHeader
                header={
                    <div className={s.cardHeader}>
                        <Text weight="semibold">
                            {title} <Badge color={color}>{relevant.length}</Badge>
                        </Text>
                        <InfoLabel size="medium" info={infoLabelTxt} />
                    </div>
                }
            />

            <div
                className={s.viewport}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => setIsDragging(false)}
                onWheel={onWheel}
            >
                <div
                    className={s.content}
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                    }}
                >
                    {title === "Transient" && <TransientView events={relevant} />}
                    {title === "Scoped" && <ScopedView events={relevant} />}
                    {title === "Singleton" && <SingletonView events={relevant} />}
                </div>

                <div className={s.controls}>
                    <Button icon={<ZoomInRegular />} onClick={() => setZoom(z => z + 0.2)} size="small" />
                    <Button icon={<ZoomOutRegular />} onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} size="small" />
                    <Button icon={<ArrowRotateClockwiseRegular />} onClick={resetView} size="small" />
                </div>
            </div>
        </Card>
    );
}