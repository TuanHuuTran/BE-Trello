/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
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

export const columnService = {
  newCreate,
  updateColumn
}
