import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JWTProvider } from '~/providers/JWTProvider'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const newCreate = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if ( existUser ) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!' )
    }

    // Tạo data để lưu vào database
    // nameFromEmail: nếu email là tuan@gmail.com thì sẽ lấy được tuan
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),

      username: nameFromEmail,
      displayname: nameFromEmail,

      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào database
    const createUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createUser.insertedId)

    // Gửi email người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Verify email before using our service'
    const htmlContent = `
    <h3>Here is your verification link:</h3>
    <h3>${verificationLink}</h3>
    `

    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // return trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) {throw error}
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if ( existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    // Neu moi thu oke  update lai thong tin user de verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {throw error}
}

const login = async (reqBody) => {
  try {
    // Query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if ( !existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if ( !bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }

    /* Nếu mọi thứ ok bắt đầu tạo Tokens đăng nhập để trả về phía FE */
    // Thông tin sẽ đính kèm trong JWT Token bao gôm _id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // Tạo ra 2 loại Token, accessToken và refreshToken để trả về phía FE
    // AccessToken
    const accessToken = await JWTProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )

    // RefreshToken
    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    )

    // Trả về thông tin của user kèm theo 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {throw error}
}

const refreshToken = async (clientRefreshToken) => {
  try {

    // Verify / giải mã cái refreshToken xem có hợp lệ không
    const refreshTokenDecoded = await JWTProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Verify / giải mã cái refreshToken xem có hợp lệ không
    // Lưu những thôn tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query db
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo AccessToken mới
    const accessToken = await JWTProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )

    return { accessToken }
  } catch (error) {throw error}
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query User
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')

    // Khoi tao ket qua update User ban dau la empty
    let updatedUser = {}

    // truong hop change password
    if (reqBody.current_password && reqBody.new_password ) {
      // kiem tra xem current_password co dung hay khong
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
      }

      // Neu nhu current_password dung thi hash mot password vaf update lai
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      } )
    } else if ( userAvatarFile) {
      // truong upload file cloud storage, cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users' )

      // Luu lai URL(secure_url) cua avatar moi upload vao database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      } )
    } else {
      // truong hop update cac thong tin chung
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {throw error}
}

export const userService = {
  newCreate,
  verifyAccount,
  login,
  refreshToken,
  update
}
