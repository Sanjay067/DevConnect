import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllProfiles } from "@/services/userService";

export const useProfiles = (search = "") => {
  return useInfiniteQuery({
    queryKey: ["profiles", search],
    queryFn: ({ pageParam = 1 }) => 
      getAllProfiles(pageParam, search).then((res) => res.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
  });
};
