import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchConfig, updateConfig } from "../api/configApi";
import { UserConfig } from "../types";

export function useConfig() {
  return useQuery<UserConfig>({
    queryKey: ["config"],
    queryFn: fetchConfig,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config"] }),
  });
}
