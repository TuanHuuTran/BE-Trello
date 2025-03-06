import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import { userRoute } from '~/routes/v1/userRoute'
import { invitationRoute } from '~/routes/v1/invitationRoute'


const Router = express.Router()

// Check API v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'hello world' })
})

// Board APIs
Router.use('/boards', boardRoute)

// Column APIs
Router.use('/columns', columnRoute)

// Card APIs
Router.use('/cards', cardRoute)

// User APIs
Router.use('/users', userRoute)

//Invitation APIs
// User APIs
Router.use('/invitations', invitationRoute)
export const APIs_V1 = Router
