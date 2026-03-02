import { createQuery, createMutation } from "@tanstack/svelte-query";

export function createSvelteAdapter(api: any) {
  return Object.entries(api).reduce((acc: any, [serviceName, endpoints]) => {
    acc[serviceName] = () => {
      const hooks: any = {};
      Object.entries(endpoints as any).forEach(
        ([endpointName, executor]: [string, any]) => {
          hooks[endpointName] = (options: any) => {
            const config = executor._config;

            if (config.method === "GET") {
              return createQuery({
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
              const mutation = createMutation({
                mutationFn: (body: any) => executor({ ...options, body }),
                ...options?.hookOptions,
              });

              return {
                execute: (mutation as any).mutate,
                data: (mutation as any).data,
                isLoading: (mutation as any).isPending,
                error: (mutation as any).error,
              };
            }
          };
        },
      );
      return hooks;
    };
    return acc;
  }, {});
}
