import { NextRequest, NextResponse } from "next/server";

const CONSOLE_COOKIE = "console_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isConsole = pathname.startsWith("/console");
  const isConsoleApi = pathname.startsWith("/api/console");

  if (!isConsole && !isConsoleApi) return NextResponse.next();
  if (pathname === "/console/login" || pathname === "/api/console/login") {
    return NextResponse.next();
  }

  const authed = req.cookies.get(CONSOLE_COOKIE)?.value === "1";
  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/console/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/console/:path*", "/api/console/:path*"],
};

