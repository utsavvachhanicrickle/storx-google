import { API } from "./apiClient";

export interface Plan {
  id: number;
  name: string;
  storage: number; // in bytes
  price: number;
  bandwidth: number;
  benefit: string[];
  validity: number;
  validity_unit: string;
  group: string;
  created_at: string;
}

export interface PlanGroup {
  name: string;
  plans: Plan[];
}

export interface PaymentPlansResponse {
  crypto_modes: string[];
  group: PlanGroup[];
}

export interface Coupon {
  id?: number;
  code: string;
  discount_percentage?: number;
  active?: boolean;
}

export const billingService = {
  /**
   * Fetches payment plans from GET /payment-plans (server root).
   * Note: This request is proxied through the Next.js rewrite configuration.
   */
  getPaymentPlans: async (): Promise<PaymentPlansResponse> => {
    const response = await API.get("/payment-plans");
    return response.data;
  },

  /**
   * Fetches active coupons from GET /payments/coupons.
   */
  getCoupons: async (): Promise<any> => {
    const response = await API.get("/payments/coupons");
    return response.data;
  },

  /**
   * Generates a checkout redirect link using POST /payments/generate-payment-link.
   */
  generatePaymentLink: async (payload: {
    planId: number;
    cryptoMode: string;
    couponCode?: string;
  }): Promise<{ redirectURL: string }> => {
    const backendPayload: Record<string, any> = {
      planId: payload.planId,
      cryptoMode: payload.cryptoMode,
    };
    if (payload.couponCode) {
      backendPayload.couponCode = payload.couponCode;
    }
    const response = await API.post("/payments/generate-payment-link", backendPayload);
    return response.data;
  },

  /**
   * Fetches past transaction history from GET /payments/invoice-history.
   */
  getInvoiceHistory: async (params?: {
    limit?: number;
    startingAfter?: string;
    starting_after?: string;
    endingBefore?: string;
    ending_before?: string;
  }): Promise<any> => {
    const query: Record<string, any> = {};
    if (params) {
      if (params.limit !== undefined) {
        query.limit = params.limit;
      }
      const start = params.starting_after || params.startingAfter;
      if (start) {
        query.starting_after = start;
      }
      const end = params.ending_before || params.endingBefore;
      if (end) {
        query.ending_before = end;
      }
    }
    const response = await API.get("/payments/invoice-history", {
      params: query,
    });
    return response.data;
  },
};
