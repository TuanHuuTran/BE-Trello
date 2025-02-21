
const MONGODB_URI = 'mongodb+srv://tuantran:bizRzcwbwH8vRrcK@cluster0.c4hd9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DATABASE_NAME = 'trello-web'

import { MongoClient, ServerApiVersion } from 'mongodb'


// Khởi tạo một đối tượng mongoClientInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

const mongoClientInstance = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME)
}

// Đóng kết nối với mongoDB 
export const CLOSE_DB = async () => {
  console.log('code chay vao close')
  await mongoClientInstance.close()
}

// Function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect
// thành công tới MongoDb để chúng ta sử dụng nhiều nơi trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái getDB này sau khi kết nối thành công tới MongoDB
export const GET_DB = () => {
  if ( !trelloDatabaseInstance ) throw new Error('Must connect to Database first')
  return trelloDatabaseInstance
}
