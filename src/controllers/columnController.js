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

const updateColumn = async ( req, res, next) => {
  try {
    const columnId = req.params.id
    const column = await columnService.updateColumn(columnId, req.body)
    res.status(StatusCodes.OK).json(column)
  } catch (error) {next(error)}
}

export const columnController = {
  newCreate,
  updateColumn
}
