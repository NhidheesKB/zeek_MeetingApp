import { inject } from '@adonisjs/core'
import { DiskService } from '#services/disk_service'
import { GeminiService } from '#services/gemini_service'
import { MeetingService } from '#services/meeting_service'
import { PuppeteerService } from '#services/report_service'
import Organization from '#models/organization'
import { unlink } from 'fs/promises'
import { AudioService } from '#services/audio_service'

@inject()
export class AudioPipelineService {
  private readonly errorMessages = [
    'The provided audio is too noisy or short. Please provide a clear or longer audio',
    'Cannot generate a report: the content is too short.',
  ]
  constructor(
    private audio: AudioService,
    private disk: DiskService,
    private gemini: GeminiService,
    private meeting: MeetingService,
    private puppeteer: PuppeteerService
  ) {}
  public async processAudioToPdf(audioFilePath: string, meetingId: number): Promise<{ pdfBuffer: Buffer; pdfName: string }> {
    const wavBuffer = await this.audio.toWavFormat(audioFilePath)
    const { url, filePath } = await this.disk.getUrl(wavBuffer)
    const langCode = await this.audio.detectLanguage(url)
    await this.handleErrorIfAny(filePath, langCode)
    const translatedText = await this.audio.toTranslatedText(url, langCode)
    const summary = await this.gemini.getSummary(translatedText)
    await this.handleErrorIfAny(filePath, summary)
    const meetingDetails = await this.meeting.getMeetDetails(meetingId)
    const organization = await Organization.query().where('id', meetingDetails[0].organization_id)
    const pdfBuffer = await this.puppeteer.generateReport(meetingDetails, organization, summary) as Buffer<ArrayBufferLike>
    const pdfName = meetingDetails[0].title
    await unlink(audioFilePath).catch(() => null)
    console.log('Translated text:', translatedText)
    console.log('Summary:', summary)
    return { pdfBuffer, pdfName }
  }

  private async handleErrorIfAny(filePath: string, message: string | undefined): Promise<void> {
    if (this.errorMessages.includes(message as string)) {
      // await this.disk.delete(filePath).catch(() => null)
      throw new Error(message)
    }
  }
}
