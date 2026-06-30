import { TokenService } from '../services/token.service';

describe('TokenService', () => {
  const originalAccessSecret = process.env.JWT_ACCESS_SECRET;
  const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  afterAll(() => {
    process.env.JWT_ACCESS_SECRET = originalAccessSecret;
    process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
  });

  it('creates and verifies access tokens', () => {
    const service = new TokenService();
    const token = service.createAccessToken({
      sub: 'user-1',
      login: 'admin',
      role: 'admin',
      companyId: 'company-1',
      branchId: null,
      faceDeviceUserId: 'face-1',
    });

    const payload = service.verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('admin');
    expect(payload.type).toBe('access');
  });

  it('hashes refresh tokens deterministically', () => {
    const service = new TokenService();
    const refreshToken = service.createRefreshToken();

    expect(service.hashRefreshToken(refreshToken)).toBe(
      service.hashRefreshToken(refreshToken),
    );
  });
});
