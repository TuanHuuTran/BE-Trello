import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const newCreate = async ( req, res, next ) => {
  try {
    const createUser = await userService.newCreate(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async ( req, res, next ) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async ( req, res, next ) => {
  try {
    const result = await userService.login(req.body)

    //  Xử lý trả về http only cookie cho phía trình duyệt

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}


export const userController = {
  newCreate,
  verifyAccount,
  login
}
