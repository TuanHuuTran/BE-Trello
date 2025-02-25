import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get lists board' })
  })
  .post( boardValidation.createNew, boardController.newCreate )

Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.updateBoard)

// API chuyển đổi card giữa các Column

Router.route('/supports/moving_card')
  .put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)
export const boardRoute = Router
