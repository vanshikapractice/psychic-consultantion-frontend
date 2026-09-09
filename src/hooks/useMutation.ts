import { useCallback, useState } from "react";

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useMutation<T = unknown, P = unknown>(
  mutationFn: (payload: P) => Promise<T>
) {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (payload: P): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await mutationFn(payload);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
        throw error;
      }
    },
    [mutationFn]
  );

  return {
    mutate,
    ...state,
  };
}
