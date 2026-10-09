import bcrypt from "bcryptjs";
import { AuthSessionUser } from "@/lib/types/dto";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// In-memory / Cookie session helper structure
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
