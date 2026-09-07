import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/validators/authValidators';

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

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'Student@Example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('student@example.com');
    }
  });

  it('rejects an invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown field', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'student@example.com', extra: 'nope' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts a valid token and password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'correcthorse' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty token', () => {
    const result = resetPasswordSchema.safeParse({ token: '', newPassword: 'correcthorse' });
    expect(result.success).toBe(false);
  });

  it('rejects a short new password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'short' });
    expect(result.success).toBe(false);
  });
});
