/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'

const START_SERVER = () => {
  const app = express()

  app.use('/v1', APIs_V1)


  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Running server at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

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
//   })
