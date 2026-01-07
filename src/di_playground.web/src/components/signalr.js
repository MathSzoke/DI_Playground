import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default function createSignalR(url, opts = {}) {
    const maxReconnectAttempts = opts.maxReconnectAttempts ?? 5;

    const backoff =
        opts.backoff ??
        (attempt => {
            const base = 1000 * Math.pow(2, attempt - 1);
            const jitter = Math.floor(Math.random() * 300);
            return base + jitter;
        });

    const logger =
        opts.logger ??
        {
            debug: (...args) => console.debug(...args),
            info: (...args) => console.info(...args),
            warn: (...args) => console.warn(...args),
            error: (...args) => console.error(...args)
        };

    let connection = null;
    let connected = false;
    let reconnectAttempts = 0;
    let manuallyStopped = false;

    const statusListeners = new Set();

    function notifyStatus() {
        statusListeners.forEach(cb => cb(connected));
    }

    function buildConnection() {
        return new HubConnectionBuilder()
            .withUrl(url)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect([])
            .build();
    }

    async function connect() {
        manuallyStopped = false;

        if (connection && connected) {
            return connection;
        }

        if (!connection) {
            connection = buildConnection();
            attachLifecycleHandlers(connection);
        }

        try {
            await connection.start();
            connected = true;
            reconnectAttempts = 0;
            notifyStatus();
            logger.info("SignalR connected to", url);
            return connection;
        } catch (err) {
            connected = false;
            notifyStatus();
            logger.error("SignalR initial connect failed:", err);
            await tryReconnect();
            return connection;
        }
    }

    async function tryReconnect() {
        while (!manuallyStopped && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts += 1;
            const waitMs = backoff(reconnectAttempts);
            logger.info(`SignalR reconnect attempt ${reconnectAttempts} in ${waitMs}ms`);
            await delay(waitMs);

            try {
                if (!connection) {
                    connection = buildConnection();
                    attachLifecycleHandlers(connection);
                }

                await connection.start();
                connected = true;
                reconnectAttempts = 0;
                notifyStatus();
                logger.info("SignalR reconnected");
                return;
            } catch (err) {
                connected = false;
                notifyStatus();
                logger.warn("SignalR reconnect attempt failed:", err);
            }
        }

        if (!connected) {
            notifyStatus();
            logger.error("SignalR failed to reconnect after attempts:", reconnectAttempts);
        }
    }

    async function disconnect() {
        manuallyStopped = true;

        if (!connection) {
            return;
        }

        try {
            await connection.stop();
        } catch (err) {
            logger.warn("SignalR stop error:", err);
        } finally {
            connected = false;
            reconnectAttempts = 0;
            connection = null;
            notifyStatus();
        }
    }

    function on(methodName, handler) {
        if (!connection) {
            connection = buildConnection();
            attachLifecycleHandlers(connection);
        }

        connection.on(methodName, handler);
    }

    function off(methodName, handler) {
        if (!connection) {
            return;
        }

        connection.off(methodName, handler);
    }

    async function send(methodName, ...args) {
        if (!connection) {
            throw new Error("SignalR connection not initialized");
        }

        await ensureConnected();
        return connection.send(methodName, ...args);
    }

    async function invoke(methodName, ...args) {
        if (!connection) {
            throw new Error("SignalR connection not initialized");
        }

        await ensureConnected();
        return connection.invoke(methodName, ...args);
    }

    async function ensureConnected() {
        if (connected && connection) {
            return;
        }

        await connect();

        if (!connected) {
            throw new Error("SignalR failed to connect");
        }
    }

    function attachLifecycleHandlers(conn) {
        conn.onclose(async err => {
            connected = false;
            notifyStatus();
            logger.warn("SignalR connection closed", err);

            if (manuallyStopped) {
                return;
            }

            reconnectAttempts = 0;
            await tryReconnect();
        });

        conn.onreconnecting(err => {
            connected = false;
            notifyStatus();
            logger.warn("SignalR reconnecting", err);
        });

        conn.onreconnected(() => {
            connected = true;
            reconnectAttempts = 0;
            notifyStatus();
            logger.info("SignalR reconnected (built-in)");
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function isConnected() {
        return connected;
    }

    function onStatusChange(cb) {
        statusListeners.add(cb);
        cb(connected);
        return () => statusListeners.delete(cb);
    }

    return {
        connect,
        disconnect,
        on,
        off,
        send,
        invoke,
        isConnected,
        onStatusChange,
        get raw() {
            return connection;
        }
    };
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const signalR = createSignalR(`${backendUrl}/hubs/di-events`);

export function startSignalR(onEvent, onStatusChange) {
    if (onStatusChange) {
        signalR.onStatusChange(onStatusChange);
    }

    signalR.on("di-event", onEvent);
    return signalR.connect();
}

export function stopSignalR() {
    return signalR.disconnect();
}

export function isSignalRConnected() {
    return signalR.isConnected();
}
