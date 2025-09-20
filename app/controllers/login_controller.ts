import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  public async Login({ request, response, auth }: HttpContext) {
    const { email, password } = request.body()
    const verifyuser = await User.findBy('email', email)
    if (!verifyuser) return response.redirect().toRoute('login')
    try {
      const user = await User.verifyCredentials(email, password)
      if (user) {
        console.log('user', user)
        await auth.use('web').login(user)
        console.log("user",user)
        return response.redirect().toRoute('dashboard')
      }
    } catch (error) {
      console.error("LoginConError",error)
    }
  }
}
