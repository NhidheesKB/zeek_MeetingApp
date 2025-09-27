import { MultiPartService } from '#services/multi_part_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
@inject()
export default class FileParserMiddleware {
  constructor(private multipart: MultiPartService) {}
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if (ctx.request.headers()['content-type']) await this.multipart.toStore(ctx.request)

    // console.log("File",file)
    // //@ts-ignore
    // ctx.request['recorder'] = file

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
