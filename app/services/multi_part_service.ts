import extensions from '#config/extensions'
import { cuid } from '@adonisjs/core/helpers'
import type { Request } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

export class MultiPartService {
  async toStore(request: Request) {
    request?.multipart?.onFile('*', {}, async (part, reporter) => {
      part.pause()
      part.on('data', reporter)
      const contentType = part.file.headers['content-type'] as string
      //@ts-ignore
      const extension = extensions[contentType]
      const filePath = app.makePath(`storage/tmp/${cuid()}.${extension}`)
      await pipeline(part, createWriteStream(filePath))
      return { tmpPath: filePath }
    })
    await request?.multipart?.process()
  }
}
