/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Handle Cors
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware centralized error handling
  // Where have next(error) will return centralized error
  app.use(errorHandlingMiddleware)

  if ( env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`Running server at ${ env.APP_HOST }:${ env.APP_PORT }/`)
    })
  } else {
    app.listen(env.APP_PORT, env.APP_HOST, () => {
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
