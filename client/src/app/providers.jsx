"use client";

import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCsrfToken } from "@/services/authService";
import { checkAuth } from "@/store/authSlice";

export default function Providers({ children }) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <InitApp />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}

function InitApp() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fire-and-forget auth bootstrap (does not block UI rendering)
    getCsrfToken().catch(console.error);
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
}
