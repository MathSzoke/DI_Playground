import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import DiCard from "./components/DiCard";
import Timeline from "./components/Timeline";
import { startSignalR, stopSignalR } from "./components/signalr";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    cardsContainer: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "space-between",
        "@media (max-width: 900px)": {
            flexDirection: "column"
        }
    }
});

export default function App() {
    const s = useStyles();
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [signalRReady, setSignalRReady] = useState(false);

    useEffect(() => {
        startSignalR(
            evt => {
                setEvents(prev => [...prev, evt]);
                setRequests(prev =>
                    prev.includes(evt.requestId)
                        ? prev
                        : [...prev, evt.requestId]
                );
            },
            status => setSignalRReady(status)
        );

        return () => {
            stopSignalR();
        };
    }, []);

    return (
        <div className={s.root}>
            <Header />
            <Controls disabled={!signalRReady} />

            <div className={s.cardsContainer}>
                <DiCard
                    title="Transient"
                    color="warning"
                    events={events}
                    infoLabelTxt="Creates a new instance every time the service is requested."
                />
                <DiCard
                    title="Scoped"
                    color="brand"
                    events={events}
                    infoLabelTxt="Creates a single instance per request and reuses it throughout that scope."
                />
                <DiCard
                    title="Singleton"
                    color="success"
                    events={events}
                    infoLabelTxt="Creates a single instance the first time it is requested and shares it across the entire application."
                />
            </div>

            <Timeline events={events} requests={requests} />
        </div>
    );
}
