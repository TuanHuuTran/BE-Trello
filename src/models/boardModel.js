import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'


// Define Collection ( Name & Schema )

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createBoard =async (userId, data) => {
  try {
    const validDate = await validateBeforeCreate(data)
    const newBoard = {
      ...validDate,
      ownerIds: [new ObjectId(userId)]
    }
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoard)
  } catch (error) { throw new Error(error)}
}

const findOneById =async (id) => {
  try {
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) { throw new Error(error)}
}

const getDetails =async (userId, boardId) => {
  try {

    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        // pipeline trong lookup là xử lý một hoặc nhiều luồng cần thiết
        // $project chỉ định vài field không muốn lấy vè bằng cách gán nó giá trị 0
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error)}
}

const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error)}
}

const updateBoard = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if ( INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu liên quan đến ObjectId thì nên biến đổi cho chuẩn dữ liệu.

    if (updateData) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error)}
}

const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error)}
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
    // Dieu kien 1: Board chua bi xoa
      { _destroy: false },
      //Dieu kien 2: cai thang userId dang thuc hien request no phai thuoc 1 trong 2 cai mang ownerIds hoac memberIds
      // su dung toan tu $all cua mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title cua board theo a-Z theo bang ma ASCII
        { $sort: { title: 1 } },
        //$facet de xu ly nhieu luong trong mot query
        { $facet: {
          // luong 1: Query Boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // bo qua so luong ban ghi cua nhung page truoc do
            { $limit: itemsPerPage } // giai han toi da so luong ban ghi tra ve tren 1 page
          ],
          // Luong 2: Query dem tong tat ca so luong ban ghi trong database va tra ve gia tri vao bien countedAllBoards 
          'queryTotalBoard': [{ $count: 'countedAllBoards' }]
        } }
      ],
      // khai bao { collation: { locale: 'en' } } fix sort title cua board theo a-Z theo bang ma ASCII B hoa truoc a
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoard[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error)}
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createBoard,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  updateBoard,
  pullColumnOrderIds,
  getBoards
}
