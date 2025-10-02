import Organization from '#models/organization'
import { AudioService } from '#services/audio_service'
import { DiskService } from '#services/disk_service'
import { GeminiService } from '#services/gemini_service'
import { MeetingService } from '#services/meeting_service'
import { PuppeteerService } from '#services/report_service'
import { audio_validator } from '#validators/validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { unlink } from 'fs/promises'
@inject()
export default class AudioController {
  constructor(
    private audio: AudioService,
    private disk: DiskService,
    private gemini: GeminiService,
    private meeting: MeetingService,
    private puppeteer: PuppeteerService
  ) {}
  public async translateAudio({ request, response, view, auth }: HttpContext) {
    const { recorder, meetingid } = await request.validateUsing(audio_validator)
    if (!recorder || !recorder.tmpPath) {
      return response.badRequest({ message: 'Invalid audio or missing file' })
    }
    try {
      const path = recorder.tmpPath
      const wavBuffer = await this.audio.toWavFormat(path)
      const { url, filePath } = await this.disk.getUrl(wavBuffer)
      await unlink(path)
      const langCode = await this.audio.detectLanguage(url)
      const errorMsg =
        'The provided audio is too noisy or short. Please provide a clear or longer audio'
      if (langCode === errorMsg) {
        await this.disk.delete(filePath)
        throw new Error(errorMsg)
      }
      const result = await this.audio.toTranslatedText(url, langCode)
      console.log('result', result)
      const summary = await this.gemini.getSummary(result)
      if (summary == 'Cannot generate a report: the content is too short.') {
        await this.disk.delete(filePath)
        throw new Error(summary)
      }
      console.log('summary', summary)
      const organization_id = auth.user?.organization_id as number
      const organization = await Organization.query().where('id', organization_id)
      const meetingDetails = await this.meeting.checkMeeting(meetingid, organization_id)
      const pdfBuffer = await this.puppeteer.generateReport(meetingDetails,organization,summary)
      const pdfName = meetingDetails[0].title
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `attachment; filename=${pdfName}-report.pdf`)
      return response.send(pdfBuffer)
    } catch (error) {
      // console.error('Bhashinis Error', error.message)
      return response.status(500).json({
        sucess: false,
        message:
          error.message ||
          'The provided audio is too noisy or short. Please provide a clear or longer audio',
      })
    }
  }
}
