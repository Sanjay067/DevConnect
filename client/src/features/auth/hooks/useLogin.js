import { useMutation } from "@tanstack/react-query";
import { login } from "../api/authApi";

export const useLogin = () => {
  return useMutation({
    mutationFn: login,

    onError: (error) => {
      console.error("Login failed:", error?.response?.data?.message);
    },
  });
};