"use client";

import { useRouter, useParams } from "next/navigation";
import { useUpdatePost, usePost } from "@/features/feed/hooks/useFeed";
import PostEditor from "@/features/feed/components/PostEditor";
import Loader from "@/shared/components/Loader";

function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId;
  const { data: post, isLoading, isError } = usePost(postId);
  const { mutate: updatePostMutation, isPending } = useUpdatePost(postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3 text-gray-600">
        <p className="font-semibold">Post not found or you do not have access.</p>
        <button
          type="button"
          onClick={() => router.push("/feed")}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          Back to feed
        </button>
      </div>
    );
  }

  const githubLink = post.links?.find((l) => l.label === "Github")?.url || "";
  const liveLink = post.links?.find((l) => l.label === "Live Demo")?.url || "";

  return (
    <PostEditor
      mode="edit"
      initialTitle={post.title || ""}
      initialShortDescription={post.shortDescription || ""}
      initialMarkdown={post.content?.blocks?.[0]?.data?.text || ""}
      initialGithubUrl={githubLink}
      initialLiveUrl={liveLink}
      initialLookingForContributors={!!post.lookingForContributors}
      isPending={isPending}
      onSubmit={(formData, callbacks) => {
        updatePostMutation(formData, {
          onSuccess: () => router.push("/feed"),
          ...callbacks,
        });
      }}
    />
  );
}

export default EditPostPage;
