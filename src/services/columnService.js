/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
const newCreate = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createColumn(newColumn)

    const getNewColumn = await columnModel.findOneById(createColumn.insertedId)

    if ( getNewColumn ) {
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const updateColumn = async (columnId, reqData) => {
  try {
    const updateData = {
      ...reqData,
      updatedAt: Date.now()
    }
    const updateColumn = await columnModel.updateColumn(columnId, updateData)
    return updateColumn
  } catch (error) {
    throw new Error(error)
  }
}

const deleteColumn = async (columnId) => {
  try {

    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }
    // delete column
    await columnModel.deleteOneById(columnId)

    // delete card
    await cardModel.deleteManyByColumnId(columnId)

    // update columnOrderIds
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its Cards deleted successfully!' }
  } catch (error) {
    throw new Error(error)
  }
}

export const columnService = {
  newCreate,
  updateColumn,
  deleteColumn
}
