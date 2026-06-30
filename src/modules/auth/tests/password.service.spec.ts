import { PasswordService } from '../services/password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies bcrypt passwords', async () => {
    const hashedPassword = await service.hashPassword('secret123');

    expect(hashedPassword.startsWith('$2')).toBe(true);
    await expect(service.verifyPassword('secret123', hashedPassword)).resolves.toBe(true);
    await expect(service.verifyPassword('wrong', hashedPassword)).resolves.toBe(false);
  });

  it('supports legacy plain text passwords', async () => {
    await expect(service.verifyPassword('secret123', 'plain$secret123')).resolves.toBe(true);
    await expect(service.verifyPassword('secret123', 'secret123')).resolves.toBe(true);
    await expect(service.verifyPassword('wrong', 'secret123')).resolves.toBe(false);
  });
});
