// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by the MIT license in LICENSE.
import { NextRequest } from "next/server";
import { handleCallingRequest } from "@/lib/public-calling-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleCallingRequest(request, (await context.params).path);
}
export { handle as GET, handle as POST, handle as DELETE };
