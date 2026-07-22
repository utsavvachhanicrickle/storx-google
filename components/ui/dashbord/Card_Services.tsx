import Button from "../Button";
import { useRouter } from "next/navigation";
import ServiceIcon from "../ServiceIcon";
export default function Card_Services({
  service,
  i,
  isActive = true,
}: {
  service: any;
  i: number;
  isActive?: boolean;
}) {
  const Router = useRouter();
  return (
    <div
      key={i}
      className={`group bg-(--bg-primary) rounded-sm border overflow-hidden shadow-sm transition-all duration-300 ${
        isActive
          ? "border-(--border) hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
          : "border-dashed border-slate-300 opacity-60"
      }`}
    >
      {/* Top Content */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          {/* Icon Box */}
          <div
            className={`w-12 h-12 rounded-sm border border-(--border) bg-(--bg-secondary) flex items-center justify-center text-sm transition-all duration-300 ${
              isActive
                ? "group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5"
                : ""
            }`}
          >
            <ServiceIcon name={service.title} className="w-10 h-10" />
          </div>

          {/* Status Badge */}
          {isActive ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ● PROTECTED
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">
              ● NOT IN USE
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-5">
          <h3
            className={`text-base font-bold leading-none text-(--text-primary) transition-colors duration-300 ${
              isActive ? "group-hover:text-emerald-500" : ""
            }`}
          >
            {service.title}
          </h3>

          <p className="text-xs text-(--text-secondary) mt-2">
            {isActive
              ? `${service.storage} • ${service.users}`
              : "Service Inactive"}
          </p>
        </div>
      </div>

      {/* Bottom Button Area */}
      <div
        className={`p-3 pt-0 transition-all duration-300 ${
          isActive ? "group-hover:bg-emerald-500/3" : ""
        }`}
      >
        <Button
          variant="other"
          disabled={!isActive}
          className={`w-full py-2 rounded-sm border! border-solid! text-xs font-bold transition-all duration-300 ${
            isActive
              ? "border-(--border)! text-(--text-primary) hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5 group-hover:border-emerald-500/30"
              : "border-slate-200! dark:border-slate-800! text-slate-400 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50"
          }`}
          onClick={() => isActive && Router.push(`/dashboard/users_groups`)}
        >
          {isActive ? "Browse & Restore" : "Inactive"}
        </Button>
      </div>
    </div>
  );
}
