import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { cancelMyWaitlistEntry, joinWaitlist, listMyWaitlist, type JoinWaitlistInput } from "../api/waitlist.api";

export function useMyWaitlist() {
  return useQuery({
    queryKey: queryKeys.waitlist.mine(),
    queryFn: listMyWaitlist,
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JoinWaitlistInput) => joinWaitlist(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.waitlist.mine() });
    },
  });
}

export function useCancelMyWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMyWaitlistEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.waitlist.mine() });
    },
  });
}
