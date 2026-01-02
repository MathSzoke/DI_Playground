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
        backgroundColor: "#2ecc71",
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

export default function SingletonView({ events }) {
    const s = useStyles();
    if (events.length === 0) return null;

    const cx = 150;
    const cy = 150;

    return (
        <div className={s.container}>
            <div
                className={s.instance}
                style={{ top: cy, left: cx }}
                title={`${events[0].lifetime} | InstanceID: ${events[0].instanceId}`}>
                {events[0].instanceId.substring(0, 6)}
            </div>

            {events.map((e, i) => {
                const layer = Math.floor(i / 8);
                const radius = 80 + (layer * 50);
                const angle = (i % (8 + layer * 4)) * (Math.PI * 2 / (8 + layer * 4)) - Math.PI / 2;
                
                const xPersona = cx + 28 + Math.cos(angle) * radius - 14;
                const yPersona = cy + 28 + Math.sin(angle) * radius - 14;

                const dx = (xPersona + 14) - (cx + 28);
                const dy = (yPersona + 14) - (cy + 28);
                const len = Math.hypot(dx, dy);
                const ang = Math.atan2(dy, dx);

                return (
                    <React.Fragment key={i}>
                        <div
                            className={s.line}
                            style={{
                                width: len,
                                top: cy + 28,
                                left: cx + 28,
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
        </div>
    );
}