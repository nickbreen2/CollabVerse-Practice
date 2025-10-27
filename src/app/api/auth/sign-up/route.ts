import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const RESERVED_HANDLES = [
  'admin', 'api', 'login', 'signup', 'dashboard', 'collablink', 
  'www', 'auth', 'signin', 'signout'
];

const SignUpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  handle: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Use lowercase letters, numbers, and hyphens; no leading/trailing hyphen")
    .min(3).max(30),
  displayName: z.string().trim().min(1, "Display name is required").max(100),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SignUpSchema.safeParse(body);
    
    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.log("[SIGN_UP_VALIDATION_ERROR]", parsed.error.flatten());
      }
      return NextResponse.json(
        { message: "Validation error", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, handle, displayName, socialPlatform, socialHandle } = parsed.data;

    // Check reserved handles
    if (RESERVED_HANDLES.includes(handle)) {
      return NextResponse.json(
        { field: 'handle', message: 'This handle is reserved' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare social data if provided
    const socialData = socialPlatform && socialHandle 
      ? { [socialPlatform]: socialHandle }
      : {};

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({ 
        data: { email, passwordHash },
        include: { store: true }
      });
      await tx.creatorStore.create({ 
        data: { 
          userId: u.id, 
          handle,
          displayName,
          social: Object.keys(socialData).length > 0 ? socialData : null
        } 
      });
      return u;
    });

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ 
      ok: true, 
      userId: user.id,
      email: user.email,
      handle 
    }, { status: 201 });
  } catch (err: any) {
    // Handle Prisma unique constraint violation
    if (err?.code === "P2002") {
      const t = Array.isArray(err?.meta?.target) ? err.meta.target[0] : err?.meta?.target;
      const field = t?.includes("email") ? "email" : t?.includes("handle") ? "handle" : "unknown";
      return NextResponse.json({ 
        field, 
        message: `${field === "email" ? "Email" : "Handle"} already taken` 
      }, { status: 409 });
    }
    
    if (process.env.NODE_ENV === "development") {
      console.error("[SIGN_UP_ERROR_DEV]", err);
      return NextResponse.json({ 
        message: "Internal error (dev)", 
        error: String(err?.message ?? err) 
      }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

