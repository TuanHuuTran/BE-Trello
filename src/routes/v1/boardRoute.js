import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get lists board' })
  })
  .post(
    authMiddleware.isAuthorized,
    boardValidation.createNew,
    boardController.newCreate
  )

Router.route('/:id')
  .get(
    authMiddleware.isAuthorized,
    boardController.getDetails
  )
  .put(authMiddleware.isAuthorized,
    boardValidation.update,
    boardController.updateBoard
  )

// API chuyển đổi card giữa các Column
Router.route('/supports/moving_card')
  .put(
    authMiddleware.isAuthorized,
    boardValidation.moveCardToDifferentColumn,
    boardController.moveCardToDifferentColumn
  )
export const boardRoute = Router
