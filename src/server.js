/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'

const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async(req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Trung Quan Dev, I am running at ${ hostname }:${ port }/`)
  })

  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook( () => {
    console.log('Disconnected from MongoDB Atlas...')
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
