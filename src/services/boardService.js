/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { slugify } from '~/utils/formatters'
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


export const boardService = {
  newCreate
}
