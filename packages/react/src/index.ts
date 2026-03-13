import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { RequestOptions } from "@simple-api/core";

export function createReactAdapter<
  T extends Record<string, Record<string, any>>,
>(api: T) {
  return Object.entries(api).reduce((acc, [serviceName, endpoints]) => {
    acc[serviceName] = () => {
      const hooks: Record<string, any> = {};

      Object.entries(endpoints).forEach(([endpointName, executor]) => {
        hooks[endpointName] = (
          options?: RequestOptions & {
            hookOptions?: any;
            invalidates?: string[];
          },
        ) => {
          const queryClient = useQueryClient();
          const config = (executor as any)._config;

          if (config.method === "GET") {
            return useQuery({
              queryKey: [
                serviceName,
                endpointName,
                options?.params,
                options?.query,
              ],
              queryFn: () => executor(options),
              ...options?.hookOptions,
            });
          } else {
            const mutation = useMutation({
              mutationFn: (body: any) => executor({ ...options, body }),
              onSuccess: (data, variables, context) => {
                // Handle complex invalidation
                if (options?.invalidates) {
                  options.invalidates.forEach((key) => {
                    if (key.endsWith("/*")) {
                      const prefix = key.replace("/*", "");
                      queryClient.invalidateQueries({
                        predicate: (query) =>
                          Array.isArray(query.queryKey) &&
                          query.queryKey[0] === prefix,
                      });
                    } else {
                      queryClient.invalidateQueries({ queryKey: [key] });
                    }
                  });
                }
                if (options?.hookOptions?.onSuccess) {
                  options.hookOptions.onSuccess(data, variables, context);
                }
              },
              ...options?.hookOptions,
            });

            // Hide .mutate() from public API, expose as 'execute'
            return {
              execute: mutation.mutate,
              executeAsync: mutation.mutateAsync,
              data: mutation.data,
              isLoading: mutation.isPending, // TanStack v5 uses isPending
              isSuccess: mutation.isSuccess,
              isError: mutation.isError,
              error: mutation.error,
              variables: mutation.variables, // For optimistic UI
              reset: mutation.reset,
            };
          }
        };
      });

      return hooks;
    };
    return acc;
  }, {} as any);
}
