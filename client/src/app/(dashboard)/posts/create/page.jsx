"use client";

import { useRouter } from "next/navigation";
import { useCreatePost } from "@/features/feed/hooks/useFeed";
import PostEditor from "@/features/feed/components/PostEditor";

function CreatePostPage() {
  const router = useRouter();
  const { mutate: createPostMutation, isPending } = useCreatePost();

  return (
    <PostEditor
      mode="create"
      isPending={isPending}
      onSubmit={(formData, callbacks) => {
        createPostMutation(formData, {
          onSuccess: () => router.push("/feed"),
          ...callbacks,
        });
      }}
    />
  );
}

export default CreatePostPage;
