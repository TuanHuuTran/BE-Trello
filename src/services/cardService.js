/* eslint-disable no-useless-catch */
import { ObjectId } from 'mongodb'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const newCreate = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createCard(newCard)

    const getNewCard = await cardModel.findOneById(createCard.insertedId)
    if ( getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoveFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}
    if (cardCoveFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoveFile.buffer, 'card-covers' )
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url } )
    } else if (updateData.commentToAdd) {
      // Tao du lieu comment de them vao database
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: new ObjectId(userInfo._id),
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unShiftNewComment(cardId, commentData)
    } else if (updateData.inComingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updateData.inComingMemberInfo)
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}
export const cardService = {
  newCreate,
  update
}
