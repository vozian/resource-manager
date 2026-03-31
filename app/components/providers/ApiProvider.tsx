import { createApiClient } from "@/lib/api/local-mock-api";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { Spinner } from "../spinner";

export const ApiProvider = createContext<
  Awaited<ReturnType<typeof createApiClient>>
>(
  // This will always be defined so there is no need for a defulat value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  null as any,
);

export function useApi() {
  return useContext(ApiProvider);
}

export function ApiProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: apiClient } = useQuery({
    queryKey: ["apiClient"],
    queryFn: createApiClient,
  });

  return apiClient ? (
    <ApiProvider value={apiClient}>{children}</ApiProvider>
  ) : (
    <Spinner />
  );
}
