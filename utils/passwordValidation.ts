import toast from "@/components/Toast";

export const validatePassword = (password: string, confirmPassword?: string): boolean => {
  if (confirmPassword !== undefined && password !== confirmPassword) {
    toast.error("Passwords do not match.");
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    toast.error(
      "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
    return false;
  }

  return true;
};
