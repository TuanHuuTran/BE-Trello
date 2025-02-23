import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const newCreate = async ( req, res, next ) => {
  try {
    const board = await boardService.newCreate(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Create success!',
      data : board
    })
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  newCreate
}
