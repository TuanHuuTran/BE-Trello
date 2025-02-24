import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const newCreate = async ( req, res, next ) => {
  try {
    const createColumn = await columnService.newCreate(req.body)
    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  newCreate
}
