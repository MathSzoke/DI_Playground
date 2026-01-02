import React from "react";
import { Button, makeStyles, Text, Divider } from "@fluentui/react-components";

const useStyles = makeStyles({
    containerButtons: {
        display: "flex",
        justifyContent: "flex-start",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "10px"
    },
    group: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap"
    }
});

export default function Controls() {
    const s = useStyles();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const run = mode => {
        fetch(`${backendUrl}/api/di/run?mode=${mode}`, {
            method: "POST"
        });
    };

    return (
        <div className={s.containerButtons}>
            <div className={s.container}>
                <Text weight="semibold">Standard operations</Text>
                <div className={s.group}>
                    <Button appearance="primary" onClick={() => run(0)}>
                        Normal request
                    </Button>
                </div>
            </div>
            <Divider vertical style={{ maxWidth: '50px' }} />
            <div className={s.container}>

                <Text weight="semibold">Captive Dependency bugs (Singleton)</Text>
                <div className={s.group}>
                    <Button appearance="outline" onClick={() => run(1)}>
                        Scoped in Singleton
                    </Button>
                    <Button appearance="outline" onClick={() => run(2)}>
                        Transient in Singleton
                    </Button>
                </div>

                <Text weight="semibold">Other patterns</Text>
                <div className={s.group}>
                    <Button appearance="outline" onClick={() => run(3)}>
                        Transient in Scoped
                    </Button>
                    <Button appearance="outline" onClick={() => run(4)}>
                        Service locator (Singleton)
                    </Button>
                </div>
            </div>
        </div>
    );
}