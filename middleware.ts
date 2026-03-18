// middleware.ts
// Route protection — redirects unauthenticated users to Discord sign-in
// Protects /perfil and /admin
// CRITICAL: Must NOT protect /api/* — doing so causes infinite redirect loop
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isProtectedRoute =
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/admin")

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Match all routes except: API routes, Next.js internals, static files, favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
