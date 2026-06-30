import type { UserRole } from '@prisma/client';

export interface AuthUserPayload {
  sub: string;
  login: string;
  role: UserRole;
  companyId: string | null;
  branchId: string | null;
  faceDeviceUserId: string | null;
}
