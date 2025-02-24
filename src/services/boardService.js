/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { cloneDeep } from 'lodash'
const newCreate = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createBoard = await boardModel.createBoard(newBoard)

    const getNewBoard = await boardModel.findOneById(createBoard.insertedId)
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong mongoDB có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
      // Cách khác là dùng convert ObjectId sang String bằng function toString rồi compare
      //column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw new Error(error)
  }
}

const updateBoard = async (boardId, reqData) => {
  try {
    const updateData = {
      ...reqData,
      updatedAt: Date.now()
    }
    const updateBoard = await boardModel.updateBoard(boardId, updateData)
    return updateBoard
  } catch (error) {
    throw new Error(error)
  }
}
export const boardService = {
  newCreate,
  getDetails,
  updateBoard
}
