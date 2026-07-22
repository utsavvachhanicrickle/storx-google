"use client";

import ConnectAccountWizard from "../ConnectAccountWizard";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignup?: boolean;
  onComplete?: () => void;
}

export default function ConnectAccountModal({
  isOpen,
  onClose,
  isSignup = false,
  onComplete,
}: ConnectAccountModalProps) {
  if (!isOpen) return null;

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
      />

      {/* Modal Card Layout */}
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
        <ConnectAccountWizard
          isSignup={isSignup}
          onClose={onClose}
          onComplete={handleComplete}
          initialStep={1}
        />
      </div>
    </>
  );
}
