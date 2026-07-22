import { useRouter } from "next/navigation";
import { DashboardStatItem } from "@/services/dashbordService";

const getBorderClass = (i: number) => {
  const colors = [
    "border-r-emerald-500",
    "border-r-blue-500",
    "border-r-amber-500",
    "border-r-cyan-500",
    "border-r-indigo-500",
  ];
  return colors[i % colors.length];
};

const splitValueAndSuffix = (val: any, title?: string) => {
  const isNullLike =
    val === null ||
    val === undefined ||
    String(val).trim() === "" ||
    String(val).toLowerCase() === "null" ||
    String(val).trim() === "[]" ||
    (Array.isArray(val) && val.length === 0);

  const lowerTitle = title?.toLowerCase() || "";

  if (isNullLike) {
    if (lowerTitle.includes("user")) {
      return { value: "0", suffix: "Users" };
    }
    if (
      lowerTitle.includes("quota") ||
      lowerTitle.includes("storage") ||
      lowerTitle.includes("stored")
    ) {
      return { value: "0.00 MB", suffix: "/ 2.00 GB" };
    }
    if (lowerTitle.includes("items") || lowerTitle.includes("sync")) {
      return { value: "0", suffix: "items" };
    }
    if (lowerTitle.includes("snapshot") || lowerTitle.includes("last")) {
      return { value: "—", suffix: "" };
    }
    if (
      lowerTitle.includes("plan") ||
      lowerTitle.includes("status") ||
      lowerTitle.includes("state")
    ) {
      return { value: "No Plan", suffix: "" };
    }
    return { value: "—", suffix: "" };
  }

  const str = String(val);

  if (lowerTitle.includes("user")) {
    return { value: str, suffix: Number(val) === 1 ? "User" : "Users" };
  }

  if (str.includes(" / ")) {
    const parts = str.split(" / ");
    return { value: parts[0], suffix: `/ ${parts[1]}` };
  }

  const match = str.match(/^([\d,%.]+|Trial|No Plan|Free)\s*(.*)$/i);
  if (match) {
    return { value: match[1], suffix: match[2] };
  }
  return { value: str, suffix: "" };
};

export default function Card_WorkspaceHealth({
  item,
  i,
  loading = false,
}: {
  item: DashboardStatItem;
  i: number;
  loading?: boolean;
}) {
  const router = useRouter();

  const mappedTitle =
    [
      "Protected User",
      "Stored Quota",
      "Download Quota",
      "Last Snapshot",
      "Plan State",
    ][i] ||
    item?.title ||
    "";

  const isStorageQuota =
    mappedTitle.toLowerCase() === "stored quota" ||
    mappedTitle.toLowerCase() === "storage quota";

  let displayDescription = item?.description || "";
  if (item?.value_2_label === "percent_used") {
    const isStored =
      mappedTitle.toLowerCase().includes("stored") ||
      mappedTitle.toLowerCase().includes("storage");
    const label = isStored ? "storage allotment" : "download allotment";
    displayDescription = `Using ${item?.value_2 ?? 0}% of 2.00 GB ${label}`;
  } else if (item?.value_2_label === "items_synced") {
    displayDescription = `${item?.value_2 ?? 0} items synced successfully`;
  }

  const buttonToShow =
    item?.button ||
    (mappedTitle === "Plan State"
      ? { label: "Upgrade", url: "/dashboard/billing" }
      : null);

  return (
    <div
      className={`bg-(--bg-primary) rounded-md border border-(--border) border-r-[5px] ${getBorderClass(
        i,
      )} p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[120px]`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="text-[9.5px] uppercase tracking-[0.12em] font-bold text-(--text-muted)">
            {mappedTitle}
          </div>

          <div className="flex items-center gap-2 shrink-0 select-none">
            {isStorageQuota && item?.status && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0"
                style={{
                  backgroundColor: item.status.backgroundColor,
                  color: item.status.textColor,
                }}
              >
                {item.status.value}
              </span>
            )}

            

            {item?.icon && item.icon.url && (
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border border-(--border)/10"
                style={{
                  backgroundColor: item.icon.backgroundColor || "transparent",
                }}
              >
                <img src={item.icon.url} alt="" className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {loading ? (
          /* Skeleton shimmer while API is loading */
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-8 w-24 rounded-sm bg-(--bg-secondary)" />
            {item?.value_2_label === "percent_used" && (
              <div className="h-1.5 w-full rounded-md bg-(--bg-secondary)" />
            )}
          </div>
        ) : (
          <>
            <div className="flex items-baseline flex-wrap gap-1.5 mt-3">
              <span className="text-[28px] font-bold leading-none text-(--text-primary)">
                {splitValueAndSuffix(item?.value_1, mappedTitle).value}
              </span>
              {splitValueAndSuffix(item?.value_1, mappedTitle).suffix && (
                <span className="text-xs text-(--text-secondary) font-medium">
                  {splitValueAndSuffix(item?.value_1, mappedTitle).suffix}
                </span>
              )}

              {!isStorageQuota && item?.status && (
                <span
                  className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ml-1.5"
                  style={{
                    backgroundColor: item.status.backgroundColor,
                    color: item.status.textColor,
                  }}
                >
                  {item.status.value}
                </span>
              )}

              {item?.value_2_label === "growth_this_week" && item?.value_2 && (
                <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider shrink-0 ml-1.5">
                  {item.value_2}
                </span>
              )}
            </div>

            {item?.value_2_label === "percent_used" && (
              <div className="mt-3 select-none">
                <div className="w-full h-1.5 rounded-md bg-(--bg-secondary) overflow-hidden">
                  <div
                    className="h-1.5 rounded-md"
                    style={{
                      width: `${item.value_2}%`,
                      backgroundColor:
                        item.status?.textColor || "var(--primary)",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(displayDescription || buttonToShow) && (
        <div className="flex items-end justify-between mt-3">
          {displayDescription ? (
            <div className="text-[10px] text-(--text-muted) font-normal">
              {displayDescription}
            </div>
          ) : (
            <div />
          )}

          {buttonToShow && (
            <button
              onClick={() => {
                if (buttonToShow) {
                  router.push(buttonToShow.url || "/dashboard/billing");
                }
              }}
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors cursor-pointer shrink-0"
            >
              {buttonToShow.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
