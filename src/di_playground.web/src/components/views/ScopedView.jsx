import React from "react";
import { Persona, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    container: { position: "relative" },
    instance: {
        position: "absolute",
        width: "56px",
        height: "56px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#3498db",
        zIndex: 10,
        userSelect: "none"
    },
    persona: { position: "absolute", zIndex: 20 },
    line: {
        position: "absolute",
        height: "2px",
        backgroundColor: "#666",
        transformOrigin: "0 50%",
        zIndex: 5
    }
});

export default function ScopedView({ events }) {
    const s = useStyles();
    const grouped = events.reduce((acc, e) => {
        acc[e.requestId] ??= [];
        acc[e.requestId].push(e);
        return acc;
    }, {});

    return (
        <div className={s.container}>
            {Object.entries(grouped).map(([reqId, items], idx) => {
                const yBase = 20 + (idx * 160);
                const xInstance = 150;

                return (
                    <React.Fragment key={reqId}>
                        <div
                            className={s.instance}
                            style={{ top: yBase, left: xInstance }}
                            title={`${items[0].lifetime} | InstanceID: ${items[0].instanceId}`}>
                            {items[0].instanceId.substring(0, 6)}
                        </div>
                        {items.map((e, i) => {
                            const spread = 80;
                            const xPersona = (xInstance + 28) - ((items.length - 1) * spread) / 2 + (i * spread) - 14;
                            const yPersona = yBase + 100;

                            const dx = (xPersona + 14) - (xInstance + 28);
                            const dy = (yPersona + 14) - (yBase + 28);
                            const len = Math.hypot(dx, dy);
                            const ang = Math.atan2(dy, dx);

                            return (
                                <React.Fragment key={i}>
                                    <div
                                        className={s.line}
                                        style={{
                                            width: len,
                                            top: yBase + 28,
                                            left: xInstance + 28,
                                            transform: `rotate(${ang}rad)`
                                        }}
                                    />
                                    <div className={s.persona} style={{ top: yPersona, left: xPersona }}>
                                        <Persona
                                            avatar={{ image: { src: `https://i.pravatar.cc/40?img=${(i % 70) + 1}` } }}
                                            size="small"
                                        />
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </div>
    );
}