import React from "react";
import { Card, Text, makeStyles, Caption1 } from "@fluentui/react-components";

const useStyles = makeStyles({
    timelineCard: {
        padding: "16px",
        overflowY: "auto",
    },
    requestRow: {
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid #333"
    },
    track: {
        position: "relative",
        height: "36px",
        backgroundColor: "#252525",
        borderRadius: "6px",
        overflow: "hidden"
    },
    bar: {
        position: "absolute",
        height: "24px",
        top: "6px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        fontSize: "11px",
        color: "white",
        fontWeight: "bold",
        transition: "all 0.2s ease-in-out",
        boxShadow: "2px 0 5px rgba(0,0,0,0.3)"
    },
    transient: { backgroundColor: "#f1c40f" },
    scoped: { backgroundColor: "#3498db" },
    singleton: { backgroundColor: "#2ecc71" }
});

export default function Timeline({ events, requests }) {
    const s = useStyles();

    const calculateStyles = (event, index, totalEvents) => {
        const type = event.lifetime.toLowerCase();
        
        let sectionOffset = 0;
        if (type === "scoped") sectionOffset = 35;
        if (type === "singleton") sectionOffset = 70;

        const posInType = index % 3;
        
        const left = sectionOffset + (posInType * 10);
        
        let width = 33 - (posInType * 10);
        
        if (sectionOffset === 70 && left + width > 98) {
            width = 98 - left;
        }

        return {
            left: `${left}%`,
            width: `${width}%`,
            opacity: event.created ? 1 : 0.6,
            zIndex: 10 + posInType
        };
    };

    return (
        <Card className={s.timelineCard}>
            <Text weight="bold" size={400} style={{ color: "#fff", marginBottom: "10px" }}>
                Lifecycle of instances
            </Text>
            
            {requests.map((reqId) => {
                const reqEvents = events.filter(e => e.requestId === reqId);
                
                return (
                    <div key={reqId} className={s.requestRow}>
                        <Caption1 style={{ color: "#ccc" }}>
                            RequestId: {reqId}
                        </Caption1>
                        
                        <div className={s.track}>
                            {reqEvents.map((e, i) => {
                                const styles = calculateStyles(e, i, reqEvents.length);
                                
                                return (
                                    <div
                                        key={i}
                                        className={`${s.bar} ${s[e.lifetime.toLowerCase()]}`}
                                        style={styles}
                                        title={`${e.lifetime} | InstanceID: ${e.instanceId}`}
                                    >
                                        {e.instanceId.substring(0, 8)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </Card>
    );
}