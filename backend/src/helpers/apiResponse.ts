import { Response } from 'express';

const apiResponse = {
  success: (res: Response, message = 'Success', data: unknown = null, statusCode = 200): Response => {
    return res.status(statusCode).json({ success: true, message, data, code: statusCode });
  },
  error: (
    res: Response,
    message = 'Something went wrong',
    errors: unknown = null,
    statusCode = 500,
    errorName = 'INTERNAL_ERROR'
  ): Response => {
    return res.status(statusCode).json({ success: false, message, errors, code: statusCode, errorName });
  },
};

export default apiResponse;
