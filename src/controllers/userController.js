import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
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

    /**
     * Xử lý trả về http Only cookie cho phía trình duyệt
     * Đối với thời gian sống của cookie thì chung ta để tối đa 14 ngày. Thời gian sống của cookie khác thời gian sống của token
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

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
