import Organization from '#models/organization'
import { AudioService } from '#services/audio_service'
import { DiskService } from '#services/disk_service'
import { GeminiService } from '#services/gemini_service'
import { MeetingService } from '#services/meeting_service'
import { PuppeteerService } from '#services/report_service'
import { inject } from '@adonisjs/core'
import fs from "node:fs"
import path from 'path'
import { unlink } from 'fs/promises'
import { WebSocketContext } from 'adonisjs-websocket'
@inject()
export default class AudioController {
  private errormsg
  constructor(
    private audio: AudioService,
    private disk: DiskService,
    private gemini: GeminiService,
    private meeting: MeetingService,
    private puppeteer: PuppeteerService,
  ) { this.errormsg = ['The provided audio is too noisy or short. Please provide a clear or longer audio', 'Cannot generate a report: the content is too short.'] }
  public async translateAudio({ ws }: WebSocketContext) {
    const checkError = async (filePath: string, message: string | undefined) => {
      this.errormsg.includes(message as string)
        ? (await this.disk.delete(filePath), (() => { throw new Error(message) })())
        : true;
    }
    const audiotoSummary = async (audiofilePath:string,meetingid: number) => {
      const wavBuffer = await this.audio.toWavFormat(audiofilePath)
      await unlink(audiofilePath)
      const { url, filePath } = await this.disk.getUrl(wavBuffer)
      const langCode = await this.audio.detectLanguage(url)
      await checkError(filePath, langCode)
      const result = await this.audio.toTranslatedText(url, langCode)
      const summary = await this.gemini.getSummary(result)
      await checkError(filePath, summary)
      const meetingDetails = await this.meeting.getMeetDetails(meetingid)
      const organization = await Organization.query().where('id', meetingDetails[0].organization_id)
      const pdfBuffer = await this.puppeteer.generateReport(meetingDetails, organization, summary)
      const pdfName = meetingDetails[0].title
      console.log("result", result)
      console.log('summary', summary)
      return { pdfBuffer, pdfName }
    }
    const filename = ws.id
    const folderPath = path.resolve('storage', 'tmp')
    fs.mkdirSync(folderPath, { recursive: true })
    const audiofilePath = path.join(folderPath, `${filename}.webm`)
    const writeStream = fs.createWriteStream(audiofilePath, { flags: 'a',autoClose:true })
    ws.on('message', (message, isBinary) => {
      if (isBinary) {
        console.log("message",message)
        writeStream.write(message)
      }
      else {
        const { meetingid } = JSON.parse(message.toString())
        console.log("path", audiofilePath)
        setImmediate(async () => {
          try {
            writeStream.end()
            writeStream.on('finish',()=>console.log("Writestream Finish"))
            const pdfDetails = await audiotoSummary(audiofilePath,meetingid)
            ws.send(JSON.stringify({ pdfName: pdfDetails.pdfName }));
            ws.send(pdfDetails.pdfBuffer);
          } catch (error) {
            await unlink(audiofilePath).catch(() => null)
            ws.send(JSON.stringify({type:"error",message:error.message.includes(500) ? this.errormsg[0] : error.message}))
            console.error("wsCloseError", error.message)
          }
        })
      }
    })
    ws.on('close', async () => {
      console.log("serverClose")
    })
    ws.on('error', (error) => {
      console.error("wserror", error)
    })
  }
}
