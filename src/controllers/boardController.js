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

const getDetails = async ( req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.getDetails(boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {next(error)}
}

const updateBoard = async ( req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.updateBoard(boardId, req.body)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {next(error)}
}

const moveCardToDifferentColumn = async ( req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}

const getBoards = async ( req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page and itemsPerPage truyen qua req.query
    const { page, itemsPerPage } = req.query
    const result = await boardService.getBoards(userId, page, itemsPerPage)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}

export const boardController = {
  newCreate,
  getDetails,
  updateBoard,
  moveCardToDifferentColumn,
  getBoards
}
