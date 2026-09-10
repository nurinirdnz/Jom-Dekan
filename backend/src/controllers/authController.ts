import type { Request, Response, NextFunction } from 'express';
import { authService, refreshExpiryDate } from '../services/authService';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookies';
import { env } from '../config/config/env';
import { AppError } from '../types/errors';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName, academicRole, universityId, fieldOfStudy, currentYear, currentSemester } =
        req.body as {
          email: string;
          password: string;
          displayName: string;
          academicRole: 'STUDENT' | 'TUTOR';
          universityId: string;
          fieldOfStudy: string;
          currentYear: number;
          currentSemester: number;
        };

      const { user, accessToken, refreshToken } = await authService.register({
        email,
        password,
        displayName,
        academicRole,
        universityId,
        fieldOfStudy,
        currentYear,
        currentSemester,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      setRefreshCookie(res, refreshToken, refreshExpiryDate());
      res.status(201).json({ message: 'Account created successfully.', user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const { user, accessToken, refreshToken } = await authService.login({
        email,
        password,
        requestId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      setRefreshCookie(res, refreshToken, refreshExpiryDate());
      res.status(200).json({ message: 'Login successful.', user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[env.jwt.refreshCookieName];
      if (!token) {
        throw AppError.unauthorized('No refresh token was provided.');
      }

      const { user, accessToken, refreshToken } = await authService.refresh({
        refreshToken: token,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      setRefreshCookie(res, refreshToken, refreshExpiryDate());
      res.status(200).json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[env.jwt.refreshCookieName];
      if (token) {
        await authService.logout(token);
      }
      clearRefreshCookie(res);
      res.status(200).json({ message: 'Logged out.' });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      const user = await authService.getCurrentUser(req.user.id);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as { email: string };
      await authService.requestPasswordReset({ email, requestId: req.requestId, ipAddress: req.ip });
      res.status(200).json({ message: 'If that email is registered, a password reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body as { token: string; newPassword: string };
      await authService.resetPassword({ token, newPassword, requestId: req.requestId, ipAddress: req.ip });
      res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body as { token: string };
      await authService.verifyEmail({ token, requestId: req.requestId, ipAddress: req.ip });
      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
