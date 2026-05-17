import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configApi } from "../api/configApi";

export function useConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["config"],
    queryFn: configApi.get,
  });

  const mutation = useMutation({
    mutationFn: configApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config"] }),
  });

  return { config: query.data, isLoading: query.isLoading, updateConfig: mutation.mutate };
}
