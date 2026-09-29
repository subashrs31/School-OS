import crypto from 'crypto';
import { sendMail } from '../utils/sendMail';
import env from '../config/appConfig';
import { throwError } from './throwError';

const generateOtp = (): string => {
  const min = Math.pow(10, env.OTP_LENGTH - 1);
  const max = Math.pow(10, env.OTP_LENGTH) - 1;
  return String(crypto.randomInt(min, max));
};

const createHash = (identifier: string, otp: string, expiry: number): string => {
  const data = `${identifier}.${otp}.${expiry}`;
  return crypto.createHmac('sha256', env.OTP_SECRET).update(data).digest('hex');
};

const sendEmailOtp = async (email: string, otp: string, name = ''): Promise<void> => {
  await sendMail({
    to: email,
    subject: 'Your Verification Code',
    template: 'otpVerification',
    variables: { otp, name: name || 'there', expiry_minutes: String(env.OTP_EXPIRY / 60000) },
  });
};

const sendMobileOtp = async (phone: string, otp: string): Promise<void> => {
  console.warn(`[OTP] Mobile OTP for ${phone}: ${otp} (SMS provider not configured)`);
};

export const sendOtp = async (
  identifier: string,
  type: 'email' | 'mobile',
  name = ''
): Promise<{ hash: string }> => {
  if (!['email', 'mobile'].includes(type)) throwError('Invalid OTP type', 400);

  const otp = generateOtp();
  const expiry = Date.now() + env.OTP_EXPIRY;
  const hash = `${createHash(identifier, otp, expiry)}.${expiry}`;

  if (type === 'email') await sendEmailOtp(identifier, otp, name);
  if (type === 'mobile') await sendMobileOtp(identifier, otp);

  return { hash };
};

export const verifyOtp = (identifier: string, otp: string, hash: string): { verified: true } => {
  const dotIndex = hash.lastIndexOf('.');
  if (dotIndex === -1) throwError('Invalid verification hash', 400);

  const hashValue = hash.substring(0, dotIndex);
  const expiry = Number(hash.substring(dotIndex + 1));

  if (!hashValue || !expiry) throwError('Invalid verification hash', 400);
  if (Date.now() > expiry) throwError('OTP expired', 400);

  const newHash = createHash(identifier, otp, expiry);
  if (!crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(hashValue))) {
    throwError('Invalid OTP', 400);
  }

  return { verified: true };
};
