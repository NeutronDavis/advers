import bcrypt from "bcryptjs";
import { AuthSessionUser } from "@/lib/types/dto";
import { prisma } from "@/lib/prisma";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function createMockSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  orgRole: "OWNER" | "MEMBER";
  clientId?: string | null;
  profileCompleteAt?: Date | null;
}): AuthSessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgRole: user.orgRole,
    clientId: user.clientId,
    profileComplete: !!user.profileCompleteAt,
  };
}

export async function getAuthSession(): Promise<AuthSessionUser | null> {
  // Queries active Admin account as current backoffice user context
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as "ADMIN",
    orgRole: admin.orgRole as "OWNER",
    clientId: admin.clientId,
    profileComplete: true,
  };
}

export async function requireAdmin(): Promise<AuthSessionUser> {
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

export async function requireStaff(): Promise<AuthSessionUser> {
  const session = await getAuthSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    throw new Error("Unauthorized: Staff or Admin access required.");
  }
  return session;
}
