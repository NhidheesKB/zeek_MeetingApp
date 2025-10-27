import { inject } from '@adonisjs/core'
import { WebSocketContext } from 'adonisjs-websocket'
import fs from 'node:fs'
import path from 'path'
import { unlink } from 'fs/promises'
import { AudioPipelineService } from '#services/audio_pipeline_service'

@inject()
export default class AudioController {
  constructor(private pipeline: AudioPipelineService) { }
  public async translateAudio({ ws }: WebSocketContext) {
    const filename = ws.id
    const folderPath = path.resolve('storage', 'tmp')
    fs.mkdirSync(folderPath, { recursive: true })
    const audiofilePath = path.join(folderPath, `${filename}.webm`)
    const writeStream = fs.createWriteStream(audiofilePath, { flags: 'a', autoClose: true })
    ws.on('message', (message, isBinary) => {
      if (isBinary) {
        writeStream.write(message)
      } else {
        setImmediate(async () => {
          try {
            const { meetingid } = JSON.parse(message.toString())
            writeStream.on('finish', () => console.log('Audio write stream finished'))
            const { pdfBuffer, pdfName } = await this.pipeline.processAudioToPdf(audiofilePath, meetingid)
            ws.send(JSON.stringify({ pdfName }))
            ws.send(pdfBuffer)
          } catch (error) {
            await unlink(audiofilePath).catch(() => null)
            ws.send(
              JSON.stringify({
                type: 'error',
                message: error.message.includes(500) ? 'The provided audio is too noisy or short. Please provide a clear or longer audio' : error.message
              }),
            )
            console.error('translateAudio error:', error.message)
          }
        })
      }
    })
    ws.on('close', async (code,reason) => {
      console.log('WebSocket connection closed',code,reason.toString())
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }
}
