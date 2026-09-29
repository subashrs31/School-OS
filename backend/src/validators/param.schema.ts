import Joi from 'joi';

const positiveInt = Joi.number().integer().positive().required();

export const tokenParamSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token cannot be empty',
    'any.required': 'Token is required',
  }),
});

export const idParamSchema = Joi.object({
  id: positiveInt.messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be positive',
    'any.required': 'ID is required',
  }),
});

export const roleIdParamSchema = Joi.object({ roleId: positiveInt });
export const userIdParamSchema = Joi.object({ userId: positiveInt });
export const moduleIdParamSchema = Joi.object({ moduleId: positiveInt });
