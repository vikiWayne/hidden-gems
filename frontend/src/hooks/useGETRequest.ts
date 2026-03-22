import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export type QueryOptions<T> = Omit<
  UseQueryOptions<T, Error>,
  "queryKey" | "queryFn"
>;

type Options<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  queryOptions?: QueryOptions<T>;
  handler?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  };
};

// T is the expected response type from the API
export const useGETRequest = <T>(options: Options<T>) => {
  const { queryFn, queryKey, queryOptions, handler } = options;

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  const queryResult = useQuery<T>({ queryKey, queryFn, ...queryOptions });
  const { status, data, error } = queryResult;

  useEffect(() => {
    if (status === "error") {
      handlerRef.current?.onError?.(error);
      return;
    }

    if (status === "success") {
      handlerRef.current?.onSuccess?.(data);
      return;
    }
  }, [status, data, error]);

  return queryResult;
};
