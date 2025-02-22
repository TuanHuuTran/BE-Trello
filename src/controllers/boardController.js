import { StatusCodes } from 'http-status-codes'

const newCreate = ( req, res ) => {
  try {

    // move service

    // return data from service
    res.status(StatusCodes.CREATED).json({ message: 'API create board' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = {
  newCreate
}
