/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEM_PER_PAGE } from '~/utils/constants'
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

const moveCardToDifferentColumn = async (reqData) => {
  try {
    // B1: Cập nhật bảng cardOrderIds của column chứa nó ( xóa khỏi column )
    await await columnModel.updateColumn(
      reqData.prevColumnId,
      {
        cardOrderIds: reqData.prevCardOrderIds,
        updatedAt: Date.now()
      }
    )
    // B2: Cập nhật bảng cardOrderIds của column tiếp theo ( thêm mới vào column )
    await await columnModel.updateColumn(
      reqData.nextColumnId,
      {
        cardOrderIds: reqData.nextCardOrderIds,
        updatedAt: Date.now()
      }
    )
    // B3: Cập nhật lại trường columnId mới của card
    await cardModel.updateCard(reqData.currentCardId, { columnId : reqData.nextColumnId })

    return { updateResult: 'Successfully!' }
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Neu khong ton tai gia tri page va itemsPerPage tu phia FE thi phai gan gia tri mac dinh
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEM_PER_PAGE

    const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  newCreate,
  getDetails,
  updateBoard,
  moveCardToDifferentColumn,
  getBoards
}
