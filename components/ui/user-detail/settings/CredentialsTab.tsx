"use client";

interface CredentialsTabProps {
  userReAuthRequired: boolean;
  onReauthenticate: () => void;
}

export default function CredentialsTab({
  userReAuthRequired = false,
  onReauthenticate,
}: CredentialsTabProps) {
  return (
    <div className="p-6 flex flex-col gap-4 h-full bg-(--bg-primary) text-(--text-primary)">
      {userReAuthRequired ? (
        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-md flex flex-col shadow-2xs">
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">
            ⚠️ Action Required
          </span>

          <h3 className="text-md font-extrabold text-(--text-primary) mt-2.5">
            You need to first authenticate yourself
          </h3>

          <p className="text-xs font-bold text-(--text-muted) mt-1.5 leading-relaxed">
            The workspace credentials for this user account have expired or been revoked. 
            Please re-authenticate to restore the connection and resume sync operations.
          </p>

          <button
            onClick={onReauthenticate}
            className="text-xs font-black text-rose-500 hover:text-rose-600 hover:underline hover:underline-offset-4 mt-4 flex items-center gap-1.5 transition select-none w-fit cursor-pointer border-none bg-transparent p-0"
          >
            Re-authenticate account →
          </button>
        </div>
      ) : (
        <div className="p-6 bg-(--bg-secondary) border border-(--border) rounded-md flex flex-col shadow-2xs">
          <span className="text-[10px] font-black uppercase text-(--text-muted) tracking-wider">
            Credential Source
          </span>

          <h3 className="text-md font-extrabold text-(--text-primary) mt-2.5">
            Workspace admin connection
          </h3>

          <p className="text-xs font-bold text-(--text-muted) mt-1.5 leading-relaxed">
            Uses tenant-wide admin OAuth. Re-authenticate from Connected Accounts
            bulk actions.
          </p>

          <button
            onClick={onReauthenticate}
            className="text-xs font-black text-teal-600 hover:text-teal-700 hover:underline hover:underline-offset-4 mt-4 flex items-center gap-1.5 transition select-none w-fit cursor-pointer border-none bg-transparent p-0"
          >
            Re-authenticate tenant →
          </button>
        </div>
      )}
    </div>
  );
}
