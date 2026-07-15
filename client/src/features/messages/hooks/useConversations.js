import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/services/messageService";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations().then((res) => res.data),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
};
