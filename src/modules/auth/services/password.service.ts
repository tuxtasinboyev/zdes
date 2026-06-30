import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { BCRYPT_SALT_ROUNDS } from '../constants/auth.constants';

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    if (!storedPassword) {
      return false;
    }

    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      return compare(password, storedPassword);
    }

    if (storedPassword.startsWith('scrypt$')) {
      return this.verifyScryptPassword(password, storedPassword);
    }

    if (storedPassword.startsWith('plain$')) {
      return this.safeCompare(password, storedPassword.slice(6));
    }

    return this.safeCompare(password, storedPassword);
  }

  private verifyScryptPassword(password: string, storedPassword: string): boolean {
    const [, salt, expectedHash] = storedPassword.split('$');

    if (!salt || !expectedHash) {
      return false;
    }

    const calculatedHash = scryptSync(password, salt, 64).toString('hex');

    return this.safeCompare(calculatedHash, expectedHash);
  }

  private safeCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
