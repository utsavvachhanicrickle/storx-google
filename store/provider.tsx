"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { getUserSlice } from "./slices/authSlice";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(getUserSlice());
  }, []);

  return (
    <Provider store={store}>
      <ToastContainer />
      {children}
    </Provider>
  );
}
