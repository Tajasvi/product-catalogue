import { useEffect, useState } from "react";

export interface ApiState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

export function useApi<T>(load: () => Promise<T>, dependencies: readonly unknown[]): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    error: undefined,
    loading: true,
  });

  useEffect(() => {
    let current = true;
    setState({ data: undefined, error: undefined, loading: true });
    load()
      .then((data) => {
        if (current) {
          setState({ data, error: undefined, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (current) {
          setState({
            data: undefined,
            error: error instanceof Error ? error : new Error("Request failed."),
            loading: false,
          });
        }
      });
    return () => {
      current = false;
    };
    // The caller provides the complete stable input list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}

