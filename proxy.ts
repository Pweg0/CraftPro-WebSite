// proxy.ts
// Next.js 16 route protection (renamed from middleware.ts in Next.js 16)
// Protects /perfil and /admin — redirects unauthenticated users to Discord sign-in
// CRITICAL: Must NOT protect /api/* — doing so causes infinite redirect loop
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isProtectedRoute =
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/admin")

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/api/auth/signin/discord", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Match all routes except: API routes, Next.js internals, static files, favicon
  // MUST exclude /api/* to avoid infinite redirect loop on /api/auth/callback/discord
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
