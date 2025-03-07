/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
// Socket io
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'
const START_SERVER = () => {
  const app = express()

  // Fix cái vụ Cache from disk của ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Config Coolie Parser
  app.use(cookieParser())

  // Handle Cors
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware centralized error handling
  // Where have next(error) will return centralized error
  app.use(errorHandlingMiddleware)

  // Create new Server boc thang app cua express de lam real-time voi socket.io
  const server = http.createServer(app)
  // Khoi tao bien io voi server va cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    //Gọi Các socket tùy theo tính năng ở đây.
    inviteUserToBoardSocket(socket)
  })

  if ( env.BUILD_MODE === 'production') {
    // Dung server.listen thay vi dung app.listen vi luc nay server da bao gom express app va da config socket.io
    server.listen(process.env.PORT, () => {
      console.log(`Running server at ${ env.APP_HOST }:${ env.APP_PORT }/`)
    })
  } else {
    server.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(`Running server at ${ env.APP_HOST }:${ env.APP_PORT }/`)
    })
  }
  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook( () => {
    console.log('Server is shutting down...')
    CLOSE_DB()
    console.log('Disconnected from MongoDB Atlas')
  })
}

// Chỉ khi kết nối database thành công thì mới start server back-end lên.
// An IIFE (Immediately Invoked Function Expression (IIFE)

(async () => {
  try {
    await CONNECT_DB()
    console.log('Connected to MongoDB cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Chỉ khi kết nối database thành công thì mới start server back-end lên.
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//
