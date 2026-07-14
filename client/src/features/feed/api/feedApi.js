

import * as feedService from "@/services/feedService";

export const getFeed = async ({ pageParam = 1 }) => {
    const res = await feedService.getFeed(pageParam, 20);
    return res.data;
};
