import { useMutation } from "@tanstack/react-query";
import { register } from "../api/authApi";

export const useRegister = () => {
  return useMutation({
    mutationFn: register,

    onError: (error) => {
      console.error("Registration failed:", error?.response?.data?.message);
    },
  });
};
