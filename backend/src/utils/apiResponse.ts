import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: string;
}

export const sendSuccess = <T>(res: Response, data: T, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

export const sendError = (res: Response, error: string, status = 500) => {
  return res.status(status).json({
    success: false,
    data: null,
    error,
  });
};
