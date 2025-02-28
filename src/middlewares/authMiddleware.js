/**
 *Middleware có nhiệm vụ quan trọng: Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
 */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JWTProvider } from '~/providers/JWTProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía client withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // Nếu như clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {

    // Bước 1: Thực hiện giải mã token có hợp lệ hay không
    const accessTokenDecoded = await JWTProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Bước 2: Nếu như token hợp lệ, gán lại thông tin user vào req.jwtDecoded, để xử dụng cho cái request đi tiếp
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho phép request đi tiếp
    next()

  } catch (error) {
    // Trường hợp 1: Nếu như accessToken bị hết hạn thì cần trả về 1 mã lỗi 410 - GONE cho FE để gọi lại refreshToken
    if (error.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'need to refresh token' ))
      return
    }

    // Trường hợp 2: Nếu như accessToken không hợp lệ thì trả trả về 401 và gọi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
