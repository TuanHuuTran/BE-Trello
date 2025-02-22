import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const newCreate = ( req, res, next ) => {
  try {

    // move service
    // return data from service
    res.status(StatusCodes.CREATED).json({ message: 'API create board' })
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  newCreate
}
