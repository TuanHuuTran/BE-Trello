import express from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'


const Router = express.Router()

Router.route('/')
  .get()
  .post(columnValidation.createNew, columnController.newCreate )

Router.route('/:id')
  .get()
  .put(columnValidation.update, columnController.updateColumn )
export const columnRoute = Router
