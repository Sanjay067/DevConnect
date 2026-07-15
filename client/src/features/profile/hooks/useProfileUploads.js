import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBanner } from "@/services/userService";

export const useProfileUploads = (userId) => {
  const queryClient = useQueryClient();

  const bannerMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("banner", file);
      return updateBanner(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return {
    uploadBanner: (file) => bannerMutation.mutate(file),
    isBannerPending: bannerMutation.isPending,
  };
};
