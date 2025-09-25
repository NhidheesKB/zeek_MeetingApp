import { AudioService } from '#services/audio_service'
import { DiskService } from '#services/disk_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { unlink } from 'fs/promises'
@inject()
export default class AudioController {
  constructor(
    private audio: AudioService,
    private disk: DiskService
  ) {}
  public async translateAudio({ request, response }: HttpContext) {
    const recorder = request
      .files('recorder', {
        extnames: ['webm'],
      })
      .at(0)
    if (!recorder || !recorder.tmpPath) {
      return response.badRequest({ message: 'Invalid audio or missing file' })
    }
    try {
      const path = recorder.tmpPath
      const wavBuffer = await this.audio.toWavFormat(path)
      const { url, filePath } = await this.disk.getUrl(wavBuffer)
      await unlink(recorder.tmpPath)
      const langCode = await this.audio.detectLanguage(url)
      const errorMsg =
        'The provided audio is too noisy or short. Please provide a clear or longer audio'
      if (langCode === errorMsg) {
        await this.disk.delete(filePath)
        return response.badRequest({
          sucess: false,
          message: errorMsg,
        })
      }
      const result = await this.audio.toTranslatedText(url, langCode)
      console.log('translated text', result)
      return response.json({
        sucess: true,
        message:
          typeof result === 'undefined' ? (await this.disk.delete(filePath), errorMsg) : result,
      })
    } catch (error) {
      console.error('Bhashinis Error', error)
      return response.status(500).json({
        sucess: false,
        message: 'The provided audio is too noisy or short. Please provide a clear or longer audio',
      })
    }
  }
}
