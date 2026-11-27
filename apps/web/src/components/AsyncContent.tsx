import type { ReactNode } from "react";

interface AsyncContentProps<T> {
  loading: boolean;
  error: Error | undefined;
  data: T | undefined;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
}

export function AsyncContent<T>({
  loading,
  error,
  data,
  children,
  loadingLabel = "Loading catalogue…",
}: AsyncContentProps<T>) {
  if (loading) {
    return <p className="state-card" role="status">{loadingLabel}</p>;
  }
  if (error) {
    return (
      <div className="state-card state-card--error" role="alert">
        <strong>We could not load this page.</strong>
        <p>{error.message}</p>
      </div>
    );
  }
  if (data === undefined) {
    return null;
  }
  return children(data);
}

