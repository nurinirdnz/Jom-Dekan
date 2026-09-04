import type { Request, Response, NextFunction } from 'express';
import { authService, refreshExpiryDate } from '../services/authService';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookies';
import { env } from '../config/config/env';
import { AppError } from '../types/errors';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body as {
        email: string;
        password: string;
        displayName: string;
      };

      const { user, accessToken, refreshToken } = await authService.register({
        email,
        password,
        displayName,
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
};
