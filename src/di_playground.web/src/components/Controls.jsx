import React from "react";
import { Button } from "@fluentui/react-components";

export default function Controls() {
const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const run = mode => {
    fetch(`${backendUrl}/api/di/run?mode=${mode}`, {
      method: "POST"
    });
  };

    return (
        <div style={{ display: "flex", gap: 8 }}>
            <Button appearance="primary" onClick={() => run("normal")}>
                New request
            </Button>

            <Button appearance="outline" onClick={() => run("bug-scoped-in-singleton")}>
                Bug: Scoped in Singleton
            </Button>
        </div>
    );
}
