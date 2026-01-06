import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default function createSignalR(url, opts = {}) {
    const maxReconnectAttempts = opts.maxReconnectAttempts ?? 5;
    const backoff =
        opts.backoff ??
        (attempt => 1000 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300));

    const logger =
        opts.logger ??
        {
            debug: (...a) => console.debug(...a),
            info: (...a) => console.info(...a),
            warn: (...a) => console.warn(...a),
            error: (...a) => console.error(...a)
        };

    const lifecycle = opts.lifecycle ?? {};

    let connection = null;
    let connected = false;
    let reconnectAttempts = 0;
    let manuallyStopped = false;

    function buildConnection() {
        return new HubConnectionBuilder()
            .withUrl(url)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect([])
            .build();
    }

    async function connect() {
        manuallyStopped = false;
        lifecycle.onConnecting?.();

        if (!connection) {
            connection = buildConnection();
            attachLifecycleHandlers(connection);
        }

        try {
            await connection.start();
            connected = true;
            reconnectAttempts = 0;
            lifecycle.onConnected?.();
            logger.info("SignalR connected");
        } catch (err) {
            connected = false;
            lifecycle.onFailed?.(err);
            await tryReconnect();
        }
    }

    async function tryReconnect() {
        while (!manuallyStopped && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            await delay(backoff(reconnectAttempts));

            try {
                if (!connection) {
                    connection = buildConnection();
                    attachLifecycleHandlers(connection);
                }
                await connection.start();
                connected = true;
                reconnectAttempts = 0;
                lifecycle.onConnected?.();
                logger.info("SignalR reconnected");
                return;
            } catch {
                connected = false;
            }
        }

        lifecycle.onFailed?.(new Error("SignalR reconnect failed"));
    }

    async function disconnect() {
        manuallyStopped = true;
        if (!connection) return;

        await connection.stop();
        connected = false;
        lifecycle.onDisconnected?.();
        connection = null;
    }

    function on(method, handler) {
        if (!connection) {
            connection = buildConnection();
            attachLifecycleHandlers(connection);
        }
        connection.on(method, handler);
    }

    function attachLifecycleHandlers(conn) {
        conn.onclose(() => {
            connected = false;
            lifecycle.onDisconnected?.();
            if (!manuallyStopped) tryReconnect();
        });
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function isConnected() {
        return connected;
    }

    return {
        connect,
        disconnect,
        on,
        isConnected
    };
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const signalR = createSignalR(`${backendUrl}/hubs/di-events`);

export function startSignalR({ onEvent, onConnected, onConnecting, onDisconnected, onFailed }) {
    signalR.on("di-event", onEvent);

    return createSignalR(`${backendUrl}/hubs/di-events`, {
        lifecycle: {
            onConnected,
            onConnecting,
            onDisconnected,
            onFailed
        }
    }).connect();
}

export function stopSignalR() {
    return signalR.disconnect();
}