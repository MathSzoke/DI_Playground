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
        backgroundColor: "#f1c40f",
        zIndex: 10,
        userSelect: "none"
    },
    persona: {
        position: "absolute",
        zIndex: 20
    },
    line: {
        position: "absolute",
        height: "2px",
        backgroundColor: "#666",
        transformOrigin: "0 50%",
        zIndex: 5
    }
});

export default function TransientView({ events }) {
    const s = useStyles();
    const itemsPerRow = 3;
    const colWidth = 120;
    const rowHeight = 150;

    return (
        <div className={s.container}>
            {events.map((e, i) => {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                const x = 40 + (col * colWidth);
                const y = 20 + (row * rowHeight);
                console.log(e);

                return (
                    <React.Fragment key={e.instanceId + i}>
                        <div
                            className={s.instance}
                            style={{ top: y, left: x }}
                            title={`${e.lifetime} | InstanceID: ${e.instanceId}`}>
                            {e.instanceId.substring(0, 6)}
                        </div>
                        <div
                            className={s.line}
                            style={{
                                width: "60px",
                                top: y + 28,
                                left: x + 28,
                                transform: "rotate(90deg)"
                            }}
                        />
                        <div className={s.persona} style={{ top: y + 90, left: x + 14 }}>
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