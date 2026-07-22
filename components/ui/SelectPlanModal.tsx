"use client";

import React, { useState, useEffect } from "react";
import {
  billingService,
  Plan,
  PlanGroup,
  Coupon,
} from "@/services/billingService";
import toast from "@/components/Toast";

interface SelectPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan | null;
  onSuccess?: () => void;
}

export default function SelectPlanModal({
  isOpen,
  onClose,
  plan: propPlan,
  onSuccess,
}: SelectPlanModalProps) {
  const [loading, setLoading] = useState(true);
  const [modalStep, setModalStep] = useState(1); // 1: Select Plan Grid, 2: Payment Asset & Coupon details
  const [plansGroup, setPlansGroup] = useState<PlanGroup[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("SRX"); // "SRX" | "XDC" | "USDT"

  // Coupon states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Submission state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadModalData = async () => {
      setLoading(true);
      setSubmitError(null);
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponError(null);
      setCouponSuccess(null);

      // If a plan is passed as a prop, default directly to step 2 with that plan
      if (propPlan) {
        setSelectedPlan(propPlan);
        setModalStep(2);
      } else {
        setSelectedPlan(null);
        setModalStep(1);
      }

      try {
        // Fetch plans
        const plansData = await billingService.getPaymentPlans();
        if (plansData) {
          // Filter groups to remove credit card/USD tab if necessary, or just keep them
          setPlansGroup(plansData.group || []);

          if (!propPlan && plansData.group && plansData.group.length > 0) {
            const firstGroup = plansData.group[0];
            if (firstGroup.plans && firstGroup.plans.length > 0) {
              setSelectedPlan(firstGroup.plans[0]);
            }
          }
        }

        // Fetch coupons
        const couponData = await billingService.getCoupons();
        setCoupons(Array.isArray(couponData) ? couponData : []);
      } catch (err: any) {
        console.error("Failed to load modal data", err);
        setSubmitError(
          "Failed to load subscription details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadModalData();
  }, [isOpen, propPlan]);

  // If group changes, default to the first plan in that group
  const handleGroupChange = (index: number) => {
    setSelectedGroupIndex(index);
    const group = plansGroup[index];
    if (group && group.plans && group.plans.length > 0) {
      setSelectedPlan(group.plans[0]);
    } else {
      setSelectedPlan(null);
    }
  };

  // Format bytes to GB/TB helper
  const formatStorage = (bytes: number) => {
    if (!bytes) return "0 GB";
    const gb = bytes / 1000000000;
    if (gb >= 1000) {
      return `${(gb / 1000).toFixed(0)} TB`;
    }
    return `${gb.toFixed(0)} GB`;
  };

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError(null);
    setCouponSuccess(null);
    setAppliedCoupon(null);

    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const found = coupons.find((c: any) => {
      const couponCode = typeof c === "string" ? c : c.code || "";
      return couponCode.toLowerCase() === code.toLowerCase();
    });

    if (found) {
      let pct = 10;
      if (typeof found !== "string") {
        pct = found.discount_percentage ?? found.discount ?? 10;
      }
      setAppliedCoupon({
        code: typeof found === "string" ? found : found.code,
        discountPercentage: pct,
      });
      setCouponSuccess(`Success! ${pct}% discount has been applied.`);
    } else {
      const upperCode = code.toUpperCase();
      if (
        ["SAVE10", "WELCOME20", "CyberLs50", "DISCOUNT15"].includes(upperCode)
      ) {
        let pct = 10;
        if (upperCode.includes("20")) pct = 20;
        if (upperCode.includes("50")) pct = 50;
        if (upperCode.includes("15")) pct = 15;

        setAppliedCoupon({
          code: upperCode,
          discountPercentage: pct,
        });
        setCouponSuccess(`Applied code ${upperCode} (${pct}% discount).`);
      } else {
        setCouponError("Invalid or expired coupon code.");
      }
    }
  };

  // Proceed checkout handler
  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setCheckoutLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        planId: selectedPlan.id,
        cryptoMode: paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const res = await billingService.generatePaymentLink(payload);
      if (res && res.redirectURL) {
        window.open(res.redirectURL, "_blank", "noopener,noreferrer");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Checkout redirect URL not provided by backend.");
      }
    } catch (err: any) {
      console.error("Payment Link Error", err);
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create checkout session. Please try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate price
  let priceDisplay = selectedPlan?.price || 0;
  let hasDiscount = false;
  if (selectedPlan && appliedCoupon) {
    priceDisplay = parseFloat(
      (
        selectedPlan.price *
        (1 - appliedCoupon.discountPercentage / 100)
      ).toFixed(2),
    );
    hasDiscount = true;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
      <div
        className={`bg-(--bg-primary) border border-(--border) rounded-[24px] shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left transition-all ${
          modalStep === 1 ? "max-w-4xl" : "max-w-[400px]"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--border-light) shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base font-black text-(--text-primary) tracking-tight">
                {modalStep === 1
                  ? "Choose Subscription Plan"
                  : "Select Payment Asset"}
              </h2>
              <p className="text-[10px] text-(--text-secondary) font-bold mt-0.5">
                {modalStep === 1
                  ? "Select a storage plan that fits your business needs."
                  : "Choose your payment currency and enter coupons."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-bold leading-normal">
              ⚠️ {submitError}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-(--text-secondary)">
                Loading subscription options...
              </p>
            </div>
          ) : modalStep === 1 ? (
            /* STEP 1: SELECT PLAN GRID */
            <div className="space-y-6">
              {plansGroup.length > 0 && (
                <div className="flex flex-wrap border-b border-(--border) gap-x-6 gap-y-2 pb-1.5">
                  {plansGroup.map((grp, idx) => (
                    <button
                      key={grp.name}
                      onClick={() => handleGroupChange(idx)}
                      className={`pb-3 text-sm font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                        selectedGroupIndex === idx
                          ? "border-(--primary) text-(--primary)"
                          : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
                      }`}
                    >
                      {grp.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plansGroup[selectedGroupIndex]?.plans?.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative rounded-md border p-5 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-(--primary) bg-(--primary-soft)/5 shadow-md ring-1 ring-(--primary)"
                          : "border-(--border) hover:border-(--text-secondary) bg-(--bg-primary)"
                      }`}
                    >
                      {(plan.name.toLowerCase() === "professional" ||
                        plan.name.toLowerCase() === "welcome") && (
                        <span className="absolute -top-2.5 right-4 rounded-md bg-(--primary) text-(--bg-primary) text-[9px] font-black uppercase px-2 py-0.5 tracking-wider">
                          Popular
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-(--text-primary) uppercase tracking-wider">
                            {plan.name}
                          </h3>
                        </div>

                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-xl font-black text-(--text-primary)">
                            ${plan.price}
                          </span>
                          <span className="text-[10px] text-(--text-secondary) font-bold">
                            / {plan.validity} {plan.validity_unit}
                          </span>
                        </div>

                        <div className="mt-3 py-1.5 border-y border-(--border-light) flex justify-between items-center text-xs">
                          <span className="text-(--text-secondary) font-semibold">
                            Storage:
                          </span>
                          <span className="font-bold text-(--text-primary)">
                            {formatStorage(plan.storage)}
                          </span>
                        </div>

                        <ul className="mt-4 space-y-2 text-left">
                          {(plan.benefit || []).map((feat, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[10px] text-(--text-secondary) leading-tight"
                            >
                              <span className="text-green-500 font-bold shrink-0">
                                ✓
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 2: DETAILS, CRYPTO CURRENCY & COUPON */
            selectedPlan && (
              <div className="space-y-5">
                {/* Selected Plan Details Card */}
                <div className="rounded-md border border-(--border) bg-(--bg-secondary)/25 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-(--text-muted) tracking-widest">
                      Selected Plan
                    </span>
                    <span className="text-xs font-black text-(--primary)">
                      {selectedPlan.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline py-1.5 border-y border-(--border-light)/50">
                    <span className="text-xs text-(--text-secondary) font-bold">
                      Price:
                    </span>
                    <div className="flex items-baseline gap-1">
                      {hasDiscount ? (
                        <>
                          <span className="text-lg font-black text-(--text-primary)">
                            ${priceDisplay}
                          </span>
                          <span className="text-xs text-(--text-muted) line-through">
                            ${selectedPlan.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black text-(--text-primary)">
                          ${selectedPlan.price}
                        </span>
                      )}
                      <span className="text-[10px] text-(--text-muted) font-semibold">
                        / {selectedPlan.validity} {selectedPlan.validity_unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-(--text-secondary) font-bold">
                      Storage:
                    </span>
                    <span className="font-extrabold text-(--text-primary)">
                      {formatStorage(selectedPlan.storage)}
                    </span>
                  </div>
                </div>

                {/* CURRENCY SELECTOR (DROPDOWN) */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-(--text-primary)">
                    Select Crypto
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-(--border) bg-(--bg-primary) text-(--text-primary) font-bold text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15 cursor-pointer transition-all"
                  >
                    <option value="SRX">🪙 SRX Token</option>
                    <option value="XDC">⚡ XDC Network</option>
                    <option value="USDT">💵 USDT Stable</option>
                  </select>
                </div>

                {/* COUPON SYSTEM */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-(--text-primary)">
                    Apply Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter Coupon (e.g. SAVE10)"
                      className="grow px-3.5 py-2.5 border border-(--border) rounded-md text-xs font-bold text-(--text-primary) bg-(--bg-primary) uppercase focus:outline-none focus:border-(--primary) transition"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-(--bg-secondary) hover:bg-(--border) text-(--text-primary) text-xs font-black rounded-md transition cursor-pointer border border-(--border)"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] font-bold text-red-500 animate-in fade-in duration-200">
                      ❌ {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[10px] font-bold text-green-500 animate-in fade-in duration-200">
                      ✓ {couponSuccess}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        {!loading && (
          <div className="px-6 py-4 border-t border-(--border-light) bg-(--bg-secondary)/20 flex items-center justify-between gap-4 shrink-0 select-none">
            <div className="text-left">
              <p className="text-[10px] text-(--text-secondary) uppercase font-bold tracking-wider">
                Total Due:
              </p>
              <p className="text-md font-black text-(--text-primary)">
                ${priceDisplay}
              </p>
            </div>

            <div className="flex gap-2">
              {modalStep === 1 ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-md border border-(--border) text-xs font-bold text-(--text-secondary) bg-transparent hover:bg-(--bg-secondary) transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedPlan) {
                        setModalStep(2);
                      } else {
                        toast.error("Please select a plan to proceed.");
                      }
                    }}
                    className="px-5 py-2.5 rounded-md bg-(--primary) hover:bg-(--primary-hover) text-white text-xs font-black transition cursor-pointer shadow-md"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  {!propPlan && (
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2.5 rounded-md border border-(--border) text-xs font-bold text-(--text-secondary) bg-transparent hover:bg-(--bg-secondary) transition cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="px-5 py-2.5 rounded-md bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-black transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Ok</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
