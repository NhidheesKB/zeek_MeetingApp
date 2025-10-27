import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  public async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.body()
    // console.log("email",email,password)
    const verifyuser = await User.findBy('email', email)
    if (!verifyuser) return response.redirect().toRoute('login')
    try {
      const user = await User.verifyCredentials(email, password)
      if (user) {
        await auth.use('web').login(user)
        console.log("user",user.email)
        return response.redirect().toRoute('meeting')
      }
    } catch (error) {
      console.error("LoginConError",error)
      return response.redirect().toRoute('login')
    }
  }
}
