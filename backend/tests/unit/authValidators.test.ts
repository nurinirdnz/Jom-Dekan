import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/validators/authValidators';

const validRegisterPayload = {
  email: 'Student@Example.com',
  password: 'Correcthorse1!',
  displayName: 'Aisyah',
  academicRole: 'STUDENT' as const,
  universityId: '11111111-1111-1111-1111-111111111111',
  fieldOfStudy: 'Computing' as const,
  currentYear: 2,
  currentSemester: 1,
  termsAccepted: true as const,
};

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse(validRegisterPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('student@example.com');
    }
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a password missing an uppercase letter', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, password: 'correcthorse1!' });
    expect(result.success).toBe(false);
  });

  it('rejects a password missing a number', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, password: 'Correcthorse!' });
    expect(result.success).toBe(false);
  });

  it('rejects a password missing a special character', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, password: 'Correcthorse1' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown field (mass-assignment defense)', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, role: 'ADMIN' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects when terms are not accepted', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it('rejects a current year out of range', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, currentYear: 9 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid academic role', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, academicRole: 'LECTURER' });
    expect(result.success).toBe(false);
  });

  it('rejects a field of study outside the fixed list', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, fieldOfStudy: 'Underwater Basket Weaving' });
    expect(result.success).toBe(false);
  });

  it('rejects a current semester out of range', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, currentSemester: 11 });
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
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'Correcthorse1!' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty token', () => {
    const result = resetPasswordSchema.safeParse({ token: '', newPassword: 'Correcthorse1!' });
    expect(result.success).toBe(false);
  });

  it('rejects a short new password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password missing an uppercase letter', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'correcthorse1!' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password missing a number', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'Correcthorse!' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password missing a special character', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'Correcthorse1' });
    expect(result.success).toBe(false);
  });
});
