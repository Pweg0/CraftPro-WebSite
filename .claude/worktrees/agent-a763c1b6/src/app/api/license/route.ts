import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { licenses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// POST /api/license — validate a license key (called by mod on startup + periodic)
export async function POST(request: Request) {
  let data: { license_key?: string; server_ip?: string }
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid JSON" }, { status: 400 })
  }

  const key = data?.license_key
  if (!key || typeof key !== "string") {
    return NextResponse.json({ valid: false, error: "Missing license_key" }, { status: 400 })
  }

  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.key, key))
    .limit(1)

  if (!license) {
    return NextResponse.json({ valid: false, error: "License not found" }, { status: 404 })
  }

  if (license.status !== "active") {
    return NextResponse.json({ valid: false, error: "License revoked", owner: license.ownerName }, { status: 403 })
  }

  // Update last validated timestamp and server IP
  await db.update(licenses)
    .set({
      lastValidatedAt: new Date(),
      serverIp: data.server_ip ?? license.serverIp,
    })
    .where(eq(licenses.id, license.id))

  return NextResponse.json({
    valid: true,
    owner: license.ownerName,
    status: license.status,
  })
}
