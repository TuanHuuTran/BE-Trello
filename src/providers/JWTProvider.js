import JWT from 'jsonwebtoken'

/**
 * Function tạo mới Token cần 3 tham số đầu vào
 * UserInfo: Những thông tin muốn đính kèm vao Token
 * SecretSignature: Chữ ký bí mật
 * TokenLife: Thời gian sống của Token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign() của JWT - Thuật toán mặc định là HS256
    return JWT.sign(userInfo, secretSignature, {algorithm: 'HS256', expiresIn: tokenLife})
  } catch (error) {throw new Error(error)}
}

/**
 * Function kiểm tra Token có hợp lệ hay không
 * Hợp lệ ở đây là kiểm tra xem Token được tạo ra có phù hợp với secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của JWT
    return JWT.verify(token, secretSignature)
  } catch (error) {throw new Error(error)}
}

export const JWTProvider = {
  generateToken,
  verifyToken
}
