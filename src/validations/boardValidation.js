import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'title is required!',
      'string.empty': 'title cannot be empty!',
      'string.min': 'title should have at least {3} characters!',
      'string.max': 'title should have at most {3} characters!',
      'string.trim': 'title must not have leading or trailing whitespace'

    }),
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'any.required': 'description is required!',
      'string.empty': 'description cannot be empty!',
      'string.min': 'description should have at least {3} characters!',
      'string.max': 'description should have at most {3} characters!',
      'string.trim': 'description must not have leading or trailing whitespace'
    })
  })

  try {
    // set abortEarly: false to return many errors
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next( new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew
}
