"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { usePathname, useSearchParams } from "next/navigation";
import {
  hydrateRecorderSessionFromSearchParams,
  isBuzzDetailsRoute,
  isRecorderRoute,
  RECORDER_SESSION_MODE,
} from "~/lib/buzz/session";
import AuthSessionSetup from "~/components/auth/auth-session-setup";
import {
  handleSessionExpired,
  isUnauthorizedResponse,
} from "~/utils/auth-session";
import { isReservedPathSegment } from "~/lib/reserved-paths";

interface AuthGuardProps {
  children: React.ReactNode;
}

type AccessStatus = "checking" | "ready" | "not-found" | "error";

interface AccessState {
  slug: string;
  token: string;
  status: AccessStatus;
}

type ApiResult = {
  status?: number;
  response?: { status?: number };
  data?: { data?: Record<string, any> };
};

const getResponseStatus = (response: ApiResult) =>
  response?.status ?? response?.response?.status;

const isSuccess = (status: number | undefined) =>
  status === 200 || status === 201;

const isMissingAccess = (status: number | undefined) =>
  status === 400 || status === 403 || status === 404;

const AccessView = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => (
  <main className="flex overflow-x-hidden" role="main">
    <div className="flex h-screen w-full flex-col">
      <div className="mt-24 flex max-w-full flex-col items-center justify-center">
        <p className="mt-5 text-xl font-semibold leading-6 text-slate-600">
          {title}
        </p>
        <p className="mt-3 text-sm font-normal leading-5 text-slate-600">
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-md bg-primary-500 px-8 py-2 text-white"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </main>
);

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [access, setAccess] = useState<AccessState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { state, dispatch } = useContext(DataContext);
  const currentSlug = pathname.split("/").filter(Boolean)[0] ?? "";
  const sessionToken =
    typeof window === "undefined"
      ? state.token || ""
      : localStorage.getItem("token") || "";
  const verifiedSessionRef = useRef<{
    token: string;
    orgId: string;
    slug: string;
    profileCallback: boolean;
  } | null>(null);
  const switchRequestRef = useRef<{
    key: string;
    promise: Promise<ApiResult>;
  } | null>(null);
  const switchQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const initializeApp = async () => {
      let token = localStorage.getItem("token");
      let orgId = localStorage.getItem("orgId");
      const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
      const isRecorder = isRecorderRoute(pathname);

      if (isRecorder) {
        const session = hydrateRecorderSessionFromSearchParams(searchParams);
        if (session.token) token = session.token;
        if (session.orgId) orgId = session.orgId;
        if (session.isRecorder) {
          dispatch({
            type: ACTIONS.BUZZ_SESSION_MODE,
            payload: RECORDER_SESSION_MODE,
          });
        }
      }

      dispatch({ type: ACTIONS.TOKEN, payload: token });
      dispatch({ type: ACTIONS.ORG_ID, payload: orgId });

      // Invitation, auth, guest Buzz, and recorder routes have their own access flow.
      if (
        isReservedPathSegment(firstSegment) ||
        isBuzzDetailsRoute(pathname) ||
        isRecorder
      ) {
        setAccess({ slug: currentSlug, token: token || "", status: "ready" });
        return;
      }

      // `/client` is a legacy alias for the signed-in user's current workspace,
      // not an organisation slug. Validate its stored organisation against the
      // authenticated user's membership list before allowing the alias through.
      if (currentSlug === "client") {
        if (!token || !orgId) {
          setAccess({
            slug: currentSlug,
            token: token || "",
            status: "not-found",
          });
          return;
        }

        setAccess({ slug: currentSlug, token, status: "checking" });
        const profileCallback = state?.profileCallback ?? false;
        const previousSession = verifiedSessionRef.current;
        if (
          previousSession?.token === token &&
          previousSession.orgId === orgId &&
          previousSession.slug === currentSlug &&
          previousSession.profileCallback === profileCallback
        ) {
          setAccess({ slug: currentSlug, token, status: "ready" });
          return;
        }

        const memberships = (await GetRequest(
          "/users/organisations"
        )) as ApiResult;
        if (cancelled) return;
        const membershipStatus = getResponseStatus(memberships);
        const organisations = memberships?.data?.data;
        if (!isSuccess(membershipStatus)) {
          if (isUnauthorizedResponse(memberships)) {
            handleSessionExpired();
            setAccess({ slug: currentSlug, token, status: "not-found" });
          } else if (isMissingAccess(membershipStatus)) {
            setAccess({ slug: currentSlug, token, status: "not-found" });
          } else {
            setAccess({ slug: currentSlug, token, status: "error" });
          }
          return;
        }

        const currentOrganisation = Array.isArray(organisations)
          ? organisations.find((organisation) => organisation?.id === orgId)
          : null;
        if (!currentOrganisation) {
          setAccess({ slug: currentSlug, token, status: "not-found" });
          return;
        }

        const profileResponse = (await GetRequest("/profile")) as ApiResult;
        if (cancelled) return;
        const profileStatus = getResponseStatus(profileResponse);
        if (!isSuccess(profileStatus)) {
          if (isUnauthorizedResponse(profileResponse)) {
            handleSessionExpired();
            setAccess({ slug: currentSlug, token, status: "not-found" });
          } else if (isMissingAccess(profileStatus)) {
            setAccess({ slug: currentSlug, token, status: "not-found" });
          } else {
            setAccess({ slug: currentSlug, token, status: "error" });
          }
          return;
        }

        dispatch({ type: ACTIONS.ORG_DATA, payload: currentOrganisation });
        dispatch({ type: ACTIONS.USER, payload: profileResponse.data?.data });
        verifiedSessionRef.current = {
          token,
          orgId,
          slug: currentSlug,
          profileCallback,
        };
        setAccess({ slug: currentSlug, token, status: "ready" });
        return;
      }

      if (!currentSlug || currentSlug === "undefined" || !token) {
        verifiedSessionRef.current = null;
        setAccess({
          slug: currentSlug,
          token: token || "",
          status: "not-found",
        });
        return;
      }

      const profileCallback = state?.profileCallback ?? false;
      const previousSession = verifiedSessionRef.current;
      if (
        previousSession?.token === token &&
        previousSession.orgId === orgId &&
        previousSession.slug === currentSlug &&
        previousSession.profileCallback === profileCallback
      ) {
        setAccess({ slug: currentSlug, token, status: "ready" });
        return;
      }

      setAccess({ slug: currentSlug, token, status: "checking" });

      const requestKey = `${token}:${currentSlug}`;
      let switchResponsePromise =
        switchRequestRef.current?.key === requestKey
          ? switchRequestRef.current.promise
          : null;

      if (!switchResponsePromise) {
        const queuedRequest = switchQueueRef.current
          .catch(() => undefined)
          .then(async () => {
            // The backend verifies membership and returns a token scoped to the
            // requested organisation. It revokes the previous token on success,
            // so queued route changes must use the newest token in storage.
            const response = (await GetRequest(
              `/users/switch-org/${encodeURIComponent(currentSlug)}`
            )) as ApiResult;
            const responseStatus = getResponseStatus(response);
            const data = response?.data?.data;
            if (
              isSuccess(responseStatus) &&
              typeof data?.access_token === "string" &&
              typeof data?.organisation?.id === "string" &&
              data?.current_organisation_slug === currentSlug
            ) {
              localStorage.setItem("token", data.access_token);
              localStorage.setItem("orgId", data.organisation.id);
              localStorage.setItem("orgSlug", data.current_organisation_slug);
            }
            return response;
          });
        switchResponsePromise = queuedRequest;
        switchRequestRef.current = { key: requestKey, promise: queuedRequest };
        switchQueueRef.current = queuedRequest.then(
          () => undefined,
          () => undefined
        );
        void queuedRequest.then(
          () => {
            if (switchRequestRef.current?.promise === queuedRequest) {
              switchRequestRef.current = null;
            }
          },
          () => {
            if (switchRequestRef.current?.promise === queuedRequest) {
              switchRequestRef.current = null;
            }
          }
        );
      }

      if (!switchResponsePromise) {
        setAccess({ slug: currentSlug, token, status: "error" });
        return;
      }

      let switchResponse: ApiResult;
      try {
        switchResponse = await switchResponsePromise;
      } catch (error) {
        if (!cancelled) {
          console.error("AuthGuard organisation validation failed:", error);
          setAccess({ slug: currentSlug, token, status: "error" });
        }
        return;
      }
      if (cancelled) return;

      const switchStatus = getResponseStatus(switchResponse);
      if (!isSuccess(switchStatus)) {
        if (isUnauthorizedResponse(switchResponse)) {
          handleSessionExpired();
          setAccess({ slug: currentSlug, token, status: "not-found" });
        } else if (isMissingAccess(switchStatus)) {
          setAccess({ slug: currentSlug, token, status: "not-found" });
        } else {
          setAccess({ slug: currentSlug, token, status: "error" });
        }
        return;
      }

      const switchData = switchResponse.data?.data;
      const nextToken = switchData?.access_token;
      const nextOrg = switchData?.organisation;
      const nextSlug = switchData?.current_organisation_slug;
      if (
        typeof nextToken !== "string" ||
        typeof nextOrg?.id !== "string" ||
        nextSlug !== currentSlug
      ) {
        setAccess({ slug: currentSlug, token, status: "not-found" });
        return;
      }

      token = nextToken;
      const verifiedOrgId: string = nextOrg.id;
      orgId = verifiedOrgId;
      dispatch({ type: ACTIONS.TOKEN, payload: token });
      dispatch({ type: ACTIONS.ORG_ID, payload: verifiedOrgId });
      dispatch({ type: ACTIONS.ORG_SLUG, payload: nextSlug });
      dispatch({ type: ACTIONS.ORG_DATA, payload: nextOrg });

      const profileResponse = (await GetRequest("/profile")) as ApiResult;
      if (cancelled) return;
      const profileStatus = getResponseStatus(profileResponse);
      if (!isSuccess(profileStatus)) {
        if (isUnauthorizedResponse(profileResponse)) {
          handleSessionExpired();
          setAccess({ slug: currentSlug, token, status: "not-found" });
        } else if (isMissingAccess(profileStatus)) {
          setAccess({ slug: currentSlug, token, status: "not-found" });
        } else {
          setAccess({ slug: currentSlug, token, status: "error" });
        }
        return;
      }

      dispatch({ type: ACTIONS.USER, payload: profileResponse.data?.data });
      verifiedSessionRef.current = {
        token,
        orgId: verifiedOrgId,
        slug: currentSlug,
        profileCallback,
      };
      setAccess({ slug: currentSlug, token, status: "ready" });
    };

    void initializeApp();
    return () => {
      cancelled = true;
    };
  }, [
    currentSlug,
    dispatch,
    pathname,
    retryCount,
    search,
    searchParams,
    state?.profileCallback,
  ]);

  const isAccessExempt =
    isReservedPathSegment(currentSlug) ||
    isBuzzDetailsRoute(pathname) ||
    isRecorderRoute(pathname);

  if (isAccessExempt) {
    return (
      <>
        <AuthSessionSetup />
        {children}
      </>
    );
  }

  // A route slug or session change invalidates the previous verification
  // synchronously, before the new effect runs.
  const activeAccess =
    access?.slug === currentSlug && access.token === sessionToken
      ? access
      : null;

  if (!activeAccess || activeAccess.status === "checking") return null;
  if (activeAccess.status === "not-found") {
    return (
      <AccessView
        title="Page not found"
        message="The page you requested could not be found."
      />
    );
  }
  if (activeAccess.status === "error") {
    return (
      <AccessView
        title="Workspace unavailable"
        message="We could not load this page. Please try again."
        onRetry={() => setRetryCount((count) => count + 1)}
      />
    );
  }

  return (
    <>
      <AuthSessionSetup />
      {children}
    </>
  );
};

export default AuthGuard;
