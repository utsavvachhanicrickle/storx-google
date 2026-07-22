import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectedRoutes, publicRoutes } from "./utils/routes";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("_tokenKey")?.value;
  const onboardingStatus = req.cookies.get("_onboarding_status")?.value;
  const { pathname } = req.nextUrl;

  // 1. Allow Next.js assets, public assets, APIs, backend proxies, and not-found pages to pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/google-backup") ||
    pathname.includes(".") ||
    pathname === "/not-found" ||
    pathname === "/404"
  ) {
    return NextResponse.next();
  }

  const isHome = pathname === "/";
  const isPublic = publicRoutes.includes(pathname) || 
                   ["/about-us", "/privacy-policy", "/terms-and-conditions"].includes(pathname);
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  
  const isConnect = pathname === "/connect" || pathname === "/login";
  const isOnboarding = pathname === "/onbording";

  // 2. Not Found Routes: If it's not home, public, or protected, serve 404
  if (!isHome && !isPublic && !isProtected) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  // 3. PRIVATE ROUTE PROTECTION: Block non-logged-in users from accessing protected routes
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/connect", req.url));
  }

  // 4. LOGGED IN REDIRECTION: Prevent logged-in users from visiting connect login page
  if (isConnect && token) {
    if (onboardingStatus === "pending") {
      return NextResponse.redirect(new URL("/onbording", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 5. ONBOARDING REDIRECTION: Redirect logged-in users away from onboarding if already completed
  if (isOnboarding && token && onboardingStatus !== "pending") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - auth (Authentication API routes)
   * - google-backup (Backup API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|auth|google-backup|_next/static|_next/image|favicon.ico).*)"],
};
