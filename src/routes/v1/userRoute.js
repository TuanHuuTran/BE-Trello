import express from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'

const Route = express.Router()

Route.route('/register')
  .post(userValidation.createNew, userController.newCreate)

Route.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Route.route('/login')
  .post(userValidation.login, userController.login)

Route.route('/logout')
  .delete(userController.logout)

Route.route('/refresh_token')
  .get(userController.refreshToken)

export const userRoute = Route
