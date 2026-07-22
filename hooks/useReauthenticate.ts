import { useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { jobService } from "@/services/jobService";
import toast from "@/components/Toast";
import { useAppSelector } from "@/store/hooks";

export function useReauthenticate(onSuccessCallback?: (email: string) => void) {
  const [loading, setLoading] = useState(false);
  const emailRef = useRef("");
  const servicesRef = useRef<string[]>([]);
  const projectIdRef = useRef("");

  const { projects } = useAppSelector((state) => state.project);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    login_hint: emailRef.current,
    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/contacts.readonly",
    onSuccess: async (codeResponse: any) => {
      const email = emailRef.current;
      if (!email) return;
      
      setLoading(true);
      try {
        // await jobService.connectGoogleBackup(codeResponse.code);

        // Update project settings after re-auth
        const pId = projectIdRef.current || projects[0]?.id || "00000000-0000-0000-0000-000000000000";
        try {
          await jobService.updateJobProject({
            active: true,
            code: codeResponse.code,
            google_email: email,
            project_id: pId,
          });
          toast.success(`Re-authenticated ${email} successfully!`);
          if (onSuccessCallback) {
            onSuccessCallback(email);
          }
        } catch (err: any) {
          toast.error(`Project configuration update failed: ${err?.response?.data?.error || err.message || err}`);
        }
      } catch (err: any) {
        toast.error(`Re-authentication failed: ${err?.response?.data?.error || err.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    onError: (error: any) => {
      toast.error(`Google Login failed: ${error}`);
    },
  } as any);

  const reauthenticate = (email: string, services: string[] = [], projectId?: string) => {
    emailRef.current = email;
    servicesRef.current = services;
    projectIdRef.current = projectId || "";
    googleLogin();
  };

  return { reauthenticate, loading };
}
