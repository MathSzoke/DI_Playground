import React from "react";
import { Button, makeStyles, Text, Divider, Spinner } from "@fluentui/react-components";

const useStyles = makeStyles({
    containerButtons: {
        display: "flex",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        gap: "12px",
        opacity: props => (props.disabled ? 0.6 : 1)
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
    },
    loadingRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    }
});

const DI_MODES = {
    NORMAL: 0,
    CAPTIVE_SCOPED: 1,
    CAPTIVE_TRANSIENT: 2,
    TRANSIENT_IN_SCOPED: 3,
    SERVICE_LOCATOR: 4
};

export default function Controls({ disabled }) {
    const s = useStyles({ disabled });
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const run = mode => {
        if (disabled) return;

        fetch(`${backendUrl}/api/di/run?mode=${mode}`, {
            method: "POST"
        });
    };

    return (
        <div className={s.containerButtons}>
            <div className={s.container}>
                <Text weight="semibold">Standard operations</Text>

                {disabled && (
                    <div className={s.loadingRow}>
                        <Spinner size="tiny" />
                        <Text size={300}>Connecting to backend…</Text>
                    </div>
                )}

                <div className={s.group}>
                    <Button
                        appearance="primary"
                        disabled={disabled}
                        loading={disabled}
                        onClick={() => run(DI_MODES.NORMAL)}
                    >
                        Normal request
                    </Button>
                </div>
            </div>

            <Divider vertical style={{ maxWidth: "50px" }} />

            <div className={s.container}>
                <Text weight="semibold">Captive Dependency bugs (Singleton)</Text>
                <div className={s.group}>
                    <Button disabled={disabled} loading={disabled} appearance="outline" onClick={() => run(DI_MODES.CAPTIVE_SCOPED)}>
                        Scoped in Singleton
                    </Button>
                    <Button disabled={disabled} loading={disabled} appearance="outline" onClick={() => run(DI_MODES.CAPTIVE_TRANSIENT)}>
                        Transient in Singleton
                    </Button>
                </div>

                <Text weight="semibold">Other patterns</Text>
                <div className={s.group}>
                    <Button disabled={disabled} loading={disabled} appearance="outline" onClick={() => run(DI_MODES.TRANSIENT_IN_SCOPED)}>
                        Transient in Scoped
                    </Button>
                    <Button disabled={disabled} loading={disabled} appearance="outline" onClick={() => run(DI_MODES.SERVICE_LOCATOR)}>
                        Service locator (Singleton)
                    </Button>
                </div>
            </div>
        </div>
    );
}