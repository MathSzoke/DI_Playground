import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

/**
 * Simple SignalR connection manager with auto-reconnect and helpers.
 *
 * Usage:
 *   const mgr = createSignalR("https://example.com/hub");
 *   await mgr.connect();
 *   mgr.on("ReceiveMessage", msg => console.log(msg));
 *   await mgr.invoke("SendMessage", "hello");
 *   await mgr.disconnect();
 */

/**
 * Create a SignalR manager.
 *
 * @param {string} url - Hub URL.
 * @param {Object} [opts] - Options.
 * @param {number} [opts.maxReconnectAttempts=5] - Max reconnect attempts.
 * @param {function(number):number} [opts.backoff] - Backoff function that receives attempt index (1..n) and returns ms to wait.
 * @param {Object} [opts.logger] - Custom logger (must have debug/info/warn/error).
 */
export default function createSignalR(url, opts = {}) {
  const maxReconnectAttempts = opts.maxReconnectAttempts ?? 5;
  const backoff =
    opts.backoff ??
    ((attempt) => {
      // exponential backoff with jitter: base 1000ms
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
      error: (...args) => console.error(...args),
    };

  let connection = null;
  let connected = false;
  let reconnectAttempts = 0;
  let manuallyStopped = false;

  function buildConnection() {
    return new HubConnectionBuilder()
      .withUrl(url)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect([]) // disable built-in automatic reconnect; use custom logic
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
      logger.info("SignalR connected to", url);
      return connection;
    } catch (err) {
      connected = false;
      logger.error("SignalR initial connect failed:", err);
      // attempt reconnect using custom logic
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
        logger.info("SignalR reconnected");
        return;
      } catch (err) {
        connected = false;
        logger.warn("SignalR reconnect attempt failed:", err);
      }
    }

    if (!connected) {
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
    conn.onclose(async (err) => {
      connected = false;
      logger.warn("SignalR connection closed", err);
      if (manuallyStopped) {
        logger.debug("SignalR was manually stopped; not attempting reconnect");
        return;
      }
      // start custom reconnect attempts
      reconnectAttempts = 0;
      await tryReconnect();
    });

    // optional: log reconnection events if built-in reconnect used in future
    conn.onreconnecting((err) => {
      connected = false;
      logger.warn("SignalR reconnecting", err);
    });

    conn.onreconnected(() => {
      connected = true;
      reconnectAttempts = 0;
      logger.info("SignalR reconnected (built-in)");
    });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isConnected() {
    return !!connected;
  }

  return {
    connect,
    disconnect,
    on,
    off,
    send,
    invoke,
    isConnected,
    // expose raw connection for advanced usage
    get raw() {
      return connection;
    },
  };
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const signalR = createSignalR(`${backendUrl}/hubs/di-events`);

export function startSignalR(onEvent) {
  signalR.on("di-event", onEvent);
  return signalR.connect();
}

export function stopSignalR() {
  return signalR.disconnect();
}