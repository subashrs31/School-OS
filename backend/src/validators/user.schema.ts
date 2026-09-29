import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
  uuid: Joi.string().trim().optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  uuid: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).optional().allow(''),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});
