"use client";

import React, { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/ui/TableCompoenets";
import DownloadIcon from "@mui/icons-material/Download";
import DebitCard from "@/components/ui/DebitCard";
import SelectPlanModal from "@/components/ui/SelectPlanModal";
import { dashbordService } from "@/services/dashbordService";
import { billingService } from "@/services/billingService";

import UnderConstruction from "@/components/ui/UnderConstruction";
export default function BackupResourcesPage(){
  return <UnderConstruction />;
}


const billingTableHead: TableColumn[] = [
  {
    key: "date",
    label: "Date",
  },
  {
    key: "invoice",
    label: "Invoice",
    sortable: true,
    sortOrder: "desc",
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    sortOrder: "desc",
  },
  {
    key: "status",
    label: "Status",
    type: "status",
  },
  {
    key: "actions",
    label: "Download",
    type: "actions",
    className: "text-right",
  },
];

export function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Current plan details from dashboard/stats
  const [planName, setPlanName] = useState("Enterprise Plan");
  const [planStatus, setPlanStatus] = useState("Free Trial");
  const [planDescription, setPlanDescription] = useState(
    "1 TB storage limit, continuous backup protection, enterprise-grade recovery, and 24/7 support included."
  );
  const [storageUsageText, setStorageUsageText] = useState("840 GB / 1 TB");
  const [storageUsagePct, setStorageUsagePct] = useState(84);
  const [planPrice, setPlanPrice] = useState("$4.50");
  const [priceUnit, setPriceUnit] = useState("/ user / month");
  const [trialExpiresText, setTrialExpiresText] = useState("Trial expires in 14 days");
  const [isTrial, setIsTrial] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(true);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Invoices from real API
      try {
        const invoicesData = await billingService.getInvoiceHistory();
        if (Array.isArray(invoicesData)) {
          const mapped = invoicesData.map((item: any) => {
            let dateVal = "—";
            if (item.date) {
              dateVal = item.date;
            } else if (item.created_at) {
              dateVal = new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });
            } else if (item.created) {
              dateVal = new Date(item.created * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });
            }

            let invoiceVal = item.invoice || item.invoice_number || item.number || item.id || "—";
            if (typeof invoiceVal === "number") {
              invoiceVal = `INV-${invoiceVal}`;
            }

            let amountVal = "—";
            if (item.amount !== undefined) {
              amountVal = typeof item.amount === "number" ? `$${item.amount.toFixed(2)}` : String(item.amount);
            } else if (item.amount_paid !== undefined) {
              amountVal = typeof item.amount_paid === "number" ? `$${(item.amount_paid / 100).toFixed(2)}` : String(item.amount_paid);
            } else if (item.price !== undefined) {
              amountVal = typeof item.price === "number" ? `$${item.price.toFixed(2)}` : String(item.price);
            }

            let statusVal = item.status || "Paid";
            if (typeof statusVal === "string") {
              statusVal = statusVal.charAt(0).toUpperCase() + statusVal.slice(1);
            }

            return {
              ...item,
              date: dateVal,
              invoice: invoiceVal,
              amount: amountVal,
              status: statusVal,
            };
          });
          setInvoiceHistory(mapped);
        } else {
          setInvoiceHistory([]);
        }
      } catch (invoiceErr) {
        console.error("Failed to load invoice history", invoiceErr);
        setInvoiceHistory([]);
      }

      // 2. Fetch stats
      try {
        const statsData = await dashbordService.getStats();
        if (Array.isArray(statsData)) {
          // Parse Storage Quota
          const storageStat = statsData.find(
            (s) => s.title?.toLowerCase() === "storage quota"
          );
          if (storageStat) {
            let val1 = storageStat.value_1;
            if (val1 !== null && val1 !== undefined) {
              if (!String(val1).includes("GB")) {
                val1 = `${val1} GB / 1 TB`;
              }
              setStorageUsageText(String(val1));
            }
            if (storageStat.value_2 !== undefined) {
              setStorageUsagePct(Number(storageStat.value_2));
            }
          }

          // Parse Plan Status
          const planStat = statsData.find(
            (s) => s.title?.toLowerCase() === "plan status"
          );
          if (planStat) {
            const val = String(planStat.value_1 || "").toLowerCase();
            const inactive = val === "none" || val === "inactive" || val === "no plan" || !planStat.value_1;
            if (inactive) {
              setHasActivePlan(false);
            } else {
              setHasActivePlan(true);
              if (planStat.description) {
                setPlanDescription(planStat.description);
                setPlanName(planStat.description);
              }
              if (planStat.value_1) {
                setPlanStatus(String(planStat.value_1));
                setIsTrial(String(planStat.value_1).toLowerCase().includes("trial"));
              }
              if (planStat.status?.value) {
                setTrialExpiresText(`Trial expires in ${planStat.status.value}`);
              }
            }
          } else {
            setHasActivePlan(false);
          }
        }
      } catch (statsErr) {
        console.error("Failed to load dashboard stats", statsErr);
      }
    } catch (err) {
      console.error("Failed to load billing page data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
            Billing & Subscriptions
          </h1>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Manage your current plan, invoices, and payment methods.
          </p>
        </div>

        {/* Loading placeholder or main dashboard grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-(--text-secondary)">Loading account billing configurations...</p>
          </div>
        ) : (
          <>
            {/* TOP GRID */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* PLAN CARD */}
              {hasActivePlan ? (
                <div className="relative overflow-hidden rounded-sm border border-(--border) bg-(--bg-primary) shadow-(--shadow-sm) xl:col-span-2">
                  <div className="absolute left-0 top-0 h-full w-1 bg-(--primary)" />

                  <div className="p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-bold text-(--text-primary)">
                            {planName}
                          </h2>

                          <span className="rounded-md bg-(--accent-soft) px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-(--primary)">
                            {planStatus}
                          </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-secondary)">
                          {planDescription}
                        </p>

                        {/* Progress */}
                        <div className="mt-7">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-(--text-secondary)">
                              Storage Usage
                            </span>

                            <span className="text-sm font-black text-(--text-primary)">
                              {storageUsageText}
                            </span>
                          </div>

                          <div className="h-3 w-full overflow-hidden rounded-md bg-(--bg-secondary)">
                            <div
                              style={{ width: `${storageUsagePct}%` }}
                              className="h-3 rounded-md bg-(--primary) transition-all duration-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="w-full sm:w-auto sm:min-w-[140px] rounded-md border border-(--border) bg-(--bg-secondary) px-4 py-3 text-center self-start sm:self-auto shrink-0">
                        <div className="text-3xl font-black tracking-tight text-(--text-primary)">
                          {planPrice}
                        </div>

                        <div className="mt-2 text-sm text-(--text-muted)">
                          {priceUnit}
                        </div>
                      </div>
                    </div>

                    {/* ALERT (Trial Warning) */}
                    {isTrial && (
                      <div className="mt-7 flex flex-col gap-4 rounded-md border border-red-200/40 bg-red-50/50 p-5 dark:bg-red-500/5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-(--bg-primary) text-2xl shadow-sm">
                            ⏳
                          </div>

                          <div>
                            <h4 className="font-bold text-(--text-primary)">
                              {trialExpiresText}
                            </h4>

                            <p className="mt-1 text-sm text-(--text-secondary) ">
                              Upgrade now to continue uninterrupted protection and
                              automated backups.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsUpgradeModalOpen(true)}
                          className="w-full sm:w-auto shrink-0 rounded-md bg-(--primary) px-5 py-3 text-sm font-bold text-white transition-all hover:bg-(--primary-hover) text-center"
                        >
                          Upgrade Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty plan state card */
                <div className="relative overflow-hidden rounded-sm border border-(--border) bg-(--bg-primary) shadow-(--shadow-sm) xl:col-span-2 flex flex-col justify-center items-center p-8 text-center min-h-[300px]">
                  <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
                  <span className="text-4xl mb-4">📦</span>
                  <h3 className="text-xl font-bold text-(--text-primary)">No Active Subscription Plan</h3>
                  <p className="mt-2 text-sm text-(--text-secondary) max-w-md">
                    You do not have any active storage plans. Please select a plan to activate backups and protect your email services.
                  </p>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="mt-6 rounded-md bg-(--primary) px-6 py-3 text-sm font-bold text-white transition-all hover:bg-(--primary-hover) shadow-md cursor-pointer"
                  >
                    Select Plan
                  </button>
                </div>
              )}

              {/* PAYMENT CARD */}
              <div className="rounded-sm border border-(--border) bg-(--bg-primary) p-6 shadow-(--shadow-sm)">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-(--text-primary)">
                    Payment Method
                  </h3>

                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${hasActivePlan ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {hasActivePlan ? "Active" : "Inactive"}
                  </span>
                </div>

                <DebitCard />

                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="mt-6 w-full rounded-md border border-(--border) bg-(--bg-primary) px-4 py-3 text-sm font-bold text-(--text-primary) transition-all hover:bg-(--bg-secondary)"
                >
                  {hasActivePlan ? "Update Payment Method" : "Setup Payment Method"}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <Table
              headers="Billing History"
              thead={billingTableHead}
              tbody={invoiceHistory}
              clickable
              onRowClick={(row) => {
                console.log("invoice clicked", row);
              }}
              actions={[
                {
                  label: "PDF",
                  icon: <DownloadIcon sx={{ fontSize: 14, color: "inherit" }} />,
                  onClick: (row) => {
                    if (row.invoice_pdf || row.pdf_url || row.url) {
                      window.open(row.invoice_pdf || row.pdf_url || row.url, "_blank");
                    } else {
                      alert("PDF download for this transaction is not available from the backend.");
                    }
                  },
                },
              ]}
            />
          </>
        )}
      </div>

      {/* Upgrade Plan Modal */}
      <SelectPlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={fetchBillingData} plan={null}      />
    </div>
  );
}
