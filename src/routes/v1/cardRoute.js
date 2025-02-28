import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { cardValidation } from '~/validations/cardValidation'


const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get lists column' })
  })
  .post(
    authMiddleware.isAuthorized,
    cardValidation.createNew,
    cardController.newCreate
  )

export const cardRoute = Router
