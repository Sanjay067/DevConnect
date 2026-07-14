import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversationMessages, sendMessage, deleteMessage } from "@/services/messageService";

export const useMessages = (selectedPeerId, myId, onSendSuccess) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", selectedPeerId],
    queryFn: () => getConversationMessages(selectedPeerId).then((res) => res.data),
    enabled: !!selectedPeerId,
    refetchInterval: (q) => (q.state.error ? false : 5000),
    refetchIntervalInBackground: false,
    retry: false,
  });

  const sendMutation = useMutation({
    mutationFn: ({ peerId, body }) => sendMessage(peerId, body),
    onMutate: async ({ peerId, body }) => {
      // Clear draft input early
      if (onSendSuccess) onSendSuccess();

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", selectedPeerId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["messages", selectedPeerId]);

      // Optimistically update to the new value
      const newOptimisticMessage = {
        _id: `temp-${Date.now()}`,
        senderId: myId,
        body,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(["messages", selectedPeerId], (old) => {
        const oldMessages = old?.messages || [];
        return {
          ...old,
          messages: [...oldMessages, newOptimisticMessage],
        };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      // Rollback to previous state
      if (context?.previousData) {
        queryClient.setQueryData(["messages", selectedPeerId], context.previousData);
      }
    },
    onSettled: () => {
      // Sync up with backend DB on completion
      queryClient.invalidateQueries({ queryKey: ["messages", selectedPeerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId) => deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ["messages", selectedPeerId] });
      const previousData = queryClient.getQueryData(["messages", selectedPeerId]);

      queryClient.setQueryData(["messages", selectedPeerId], (old) => {
        const oldMessages = old?.messages || [];
        return {
          ...old,
          messages: oldMessages.filter((m) => String(m._id) !== String(messageId)),
        };
      });

      return { previousData };
    },
    onError: (err, messageId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["messages", selectedPeerId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedPeerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messagesData: query.data,
    loadingMessages: query.isLoading,
    messagesError: query.isError,
    messagesErrorObj: query.error,
    sendMutation,
    deleteMutation,
  };
};
