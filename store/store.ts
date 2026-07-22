import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobReducer from "./slices/jobSlice";
import notificationsReducer from "./slices/notificationSlice";
import userReducer from "./slices/userSlice";
import auditReducer from "./slices/auditSlice";
import policyReducer from "./slices/policySlice";
import restoreReducer from "./slices/restoreSlice";
import projectReducer from "./slices/projectSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        job: jobReducer,
        notifications: notificationsReducer,
        audit: auditReducer,
        policy: policyReducer,
        restore: restoreReducer,
        project: projectReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;