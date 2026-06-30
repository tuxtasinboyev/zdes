import type { UserRole } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/auth-metadata.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
