import { registerSchema, loginSchema } from '../../src/validators/authValidators';

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      email: 'Student@Example.com',
      password: 'correcthorse',
      displayName: 'Aisyah',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('student@example.com');
    }
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({
      email: 'student@example.com',
      password: 'short',
      displayName: 'Aisyah',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown field (mass-assignment defense)', () => {
    const result = registerSchema.safeParse({
      email: 'student@example.com',
      password: 'correcthorse',
      displayName: 'Aisyah',
      role: 'ADMIN',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'correcthorse',
      displayName: 'Aisyah',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires a non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'student@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});
