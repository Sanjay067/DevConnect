import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/authApi";
import { useDispatch } from "react-redux";
import { clearUser } from "@/store/authSlice";


export const useLogout = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logout,

        onSuccess: () => {
            dispatch(clearUser());
            queryClient.clear();

        },

        onError: (error) => {
            console.error("Logout failed:", error?.response?.data?.message);
        },
    });
};