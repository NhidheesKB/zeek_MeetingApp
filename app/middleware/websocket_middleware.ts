import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class WebsocketMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const token = request.cookie('ZeekMeeting-session')

    if (!token) throw new Exception('Aborting request')

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}