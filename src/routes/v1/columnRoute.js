import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { columnValidation } from '~/validations/columnValidation'


const Router = express.Router()

Router.route('/')
  .get()
  .post(
    authMiddleware.isAuthorized,
    columnValidation.createNew,
    columnController.newCreate
  )

Router.route('/:id')
  .get()
  .put(
    authMiddleware.isAuthorized,
    columnValidation.update,
    columnController.updateColumn
  )
  .delete(
    authMiddleware.isAuthorized,
    columnValidation.deleteColumn,
    columnController.deleteColumn
  )
export const columnRoute = Router
