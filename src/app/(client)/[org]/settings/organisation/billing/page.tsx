"use client";
import React, { Suspense, useContext, useEffect } from "react";
import SettingsLabel from "../../components/settings-label";
import BillingHeader from "./components/billing-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import BillingPaymentHistoryTable from "./components/billing-payment-history-table";
import axios from "axios";
import { DataContext } from "~/store/GlobalState";
import { useGetCurrentSubscription } from "~/utils/subscriptionPlans";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";
import { showError, showSuccess } from "~/components/toast/sonner";
import { useRBAC } from "~/hooks/useRBAC";

export const Client = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug, orgData } = state;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [creditTransactions, setCreditTransactions] = React.useState([]);
  const [creditTransactionsLoading, setCreditTransactionsLoading] =
    React.useState(true);

  const { currentSubscription } = useGetCurrentSubscription();
  const { hasPermission } = useRBAC();
  const canManageBilling = hasPermission("manage:billing");

  // Fetch credit transactions for payment history
  const fetchCreditTransactions = React.useCallback(async () => {
    try {
      setCreditTransactionsLoading(true);
      const token = localStorage.getItem("token") || "";
      const orgId = localStorage.getItem("orgId") || "";

      if (!orgId || !token) {
        console.warn("Missing orgId or token for credit transactions request");
        setCreditTransactionsLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions/list/${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle both successful response with data and null data
      if (response.status === 200) {
        setCreditTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      // Set empty array on error to show empty state
      setCreditTransactions([]);
    } finally {
      setCreditTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditTransactions();
  }, [fetchCreditTransactions]);

  // Complete Stripe checkout return & strip session_id query param (#1294)
  const inFlightSessionRef = React.useRef<string | null>(null);
  const completedSessionRef = React.useRef<string | null>(null);

  useEffect(() => {
    const completePayment = async () => {
      if (
        !sessionId ||
        inFlightSessionRef.current === sessionId ||
        completedSessionRef.current === sessionId
      ) {
        return;
      }
      inFlightSessionRef.current = sessionId;

      try {
        const res = await GetRequest(
          `/subscriptions/complete?session_id=${sessionId}`
        );
        if (res?.status === 200 || res?.status === 201) {
          completedSessionRef.current = sessionId;
          inFlightSessionRef.current = null;
          showSuccess("Subscription payment completed successfully!");
          // Replace URL to strip session_id and prevent re-triggering on navigation/refresh
          if (orgSlug) {
            router.replace(`/${orgSlug}/settings/organisation/billing`);
          } else {
            router.replace(window.location.pathname);
          }
          fetchCreditTransactions();
        } else {
          // GetRequest returns Axios errors rather than throwing; clear in-flight state to allow retry
          inFlightSessionRef.current = null;
          const errMsg =
            res?.response?.data?.message ||
            res?.message ||
            "Failed to complete subscription payment. Please try again or contact support.";
          showError(errMsg);
          console.error("Error completing payment:", res);
        }
      } catch (err: any) {
        inFlightSessionRef.current = null;
        showError("An unexpected error occurred while completing payment.");
        console.error("Error completing payment:", err);
      }
    };

    if (sessionId) {
      completePayment();
    }
  }, [sessionId, orgSlug, router, fetchCreditTransactions]);

  return (
    <div>
      <SettingsLabel />
      <div className="p-4 lg:px-8">
        <div className="mb-6">
          <h1 className="text-base font-semibold">
            Your Organisation Billing Information
          </h1>
          <p className="text-sm text-[#344054]">
            Securely manage your organisation’s billing details, payment
            history, and subscriptions.
          </p>
        </div>

        <BillingHeader
          title={`Zedu ${orgData?.organisation_plan?.plan_details?.name || "Free"}`}
          description="You are enjoying the full Zedu experience with the ability to add as many users to your organisation."
          onComparePlan={
            canManageBilling
              ? () =>
                  router.push(
                    `/${orgSlug}/settings/organisation/billing/all-plans`
                  )
              : undefined
          }
        />

        <Tabs defaultValue={"payment-history"} className="w-full mt-6">
          <div className="border-b border-gray-200">
            <TabsList className="flex w-fit bg-white rounded-none h-auto p-0 space-x-10">
              <TabsTrigger
                value="payment-history"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-black rounded-none py-3 px-0 font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Payment History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payment-history" className="mt-6">
            <BillingPaymentHistoryTable
              transactionData={creditTransactions}
              isLoading={creditTransactionsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={null}>
      <Client />
    </Suspense>
  );
};
export default Page;
