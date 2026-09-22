import type { WebSocketConnectionStatus } from "../services/websocket";

export type ConnectionStatusType = WebSocketConnectionStatus;

export interface ConnectionStatusProps {
  status: ConnectionStatusType;
  onRetry?: () => void;
}

const labels: Record<ConnectionStatusType, string> = {
  connecting: "Connecting…",
  connected: "Connected",
  reconnecting: "Reconnecting…",
  disconnected: "Disconnected",
  error: "Connection error",
};

const dotClasses: Record<ConnectionStatusType, string> = {
  connecting: "bg-warning animate-pulse",
  connected: "bg-success",
  reconnecting: "bg-warning animate-pulse",
  disconnected: "bg-error",
  error: "bg-error",
};

export function ConnectionStatus({ status, onRetry }: ConnectionStatusProps) {
  const canRetry = status === "disconnected" || status === "error" || status === "reconnecting";

  return (
    <div className="flex items-center gap-2 text-sm" aria-live="polite" data-testid="connection-status">
      <span className={dotClasses[status]} aria-hidden="true"></span>
      <span className="text-neutral-700 dark:text-neutral-200">{labels[status]}</span>
      {canRetry && onRetry && (
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          onClick={onRetry}
          aria-label="Retry connection"
        >
          Retry
        </button>
      )}
    </div>
  );
}
