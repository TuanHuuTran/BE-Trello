import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'


const Router = express.Router()

Router.route('/')
  .get()
  .post(columnValidation.createNew, columnController.newCreate )

export const columnRoute = Router
