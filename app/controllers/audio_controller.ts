import Organization from '#models/organization'
import { AudioService } from '#services/audio_service'
import { DiskService } from '#services/disk_service'
import { GeminiService } from '#services/gemini_service'
import { MeetingService } from '#services/meeting_service'
import { PuppeteerService } from '#services/report_service'
import { audio_validator } from '#validators/validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// import { unlink } from 'fs/promises'
@inject()
export default class AudioController {
  constructor(
    private audio: AudioService,
    private disk: DiskService,
    private gemini: GeminiService,
    private meeting: MeetingService,
    private puppeteer: PuppeteerService
  ) { }
  public async translateAudio({ request, response, auth }: HttpContext) {
    const { recorder, meetingid } = await request.validateUsing(audio_validator)
    if (!recorder || !recorder.tmpPath) {
      return response.badRequest({ message: 'Invalid audio or missing file' })
    }
    try {
      // const path = recorder.tmpPath
      // const wavBuffer = await this.audio.toWavFormat(path)
      // const { url, filePath } = await this.disk.getUrl(wavBuffer)
      // await unlink(path)
      // const langCode = await this.audio.detectLanguage(url)
      // const errorMsg =
      //   'The provided audio is too noisy or short. Please provide a clear or longer audio'
      // if (langCode === errorMsg) {
      //   await this.disk.delete(filePath)
      //   throw new Error(errorMsg)
      // }
      // const result = await this.audio.toTranslatedText(url, langCode)
      const result="Vanakkam ellarukkum! Good morning everyone, first of all, unga busy schedule-la irundhu ivlo periya time eduthu inga attend pannirukkinga, thank you so much, and I feel extremely proud to stand in front of all of you today for this meeting. Ippo namma company’s journey, achievements, challenges, and importantly, our future vision patha pesalaam. When we started this company, namakku oru clear vision irundhudhu — to build something meaningful, impactful, and sustainable, and initial days-la, team romba chinna size-la irundhudhu; namma ellarum multiple hats potu work pannom — development, sales, support, everything. Step by step, namma milestones achieve pannom, first project success kuduthu, adhu namma growth-kku strong foundation aagiduchu, and in the past few years, revenue numbers steadily increase aagudhu, customer base expand aagudhu, brand value improve aagudhu, and ellam possible aana reason unga hard work, dedication, and continuous learning spirit. Let’s take a moment to celebrate some achievements: last financial year-la, namma revenue 45% increase aagiduchu, customer satisfaction score crossed 90%, international markets-la 3 new clients sign pannom, technology team introduced 2 major innovations, which helped reduce costs and improve speed, and indha achievements namma teamwork-ku oru strong proof, because each and every department contributed — HR, Finance, Tech, Operations, Sales, Marketing — everyone played a role, and namma success oda highlight: innovation plus consistency. Of course, growth path smooth-aa irundhudhu nu solla mudiyadhu; challenges irundhadhu — last year supply chain disruptions, unexpected market fluctuations, manpower shortage — ellam namma face pannom, but instead of panicking, namma adaptive mindset use pannom, remote work culture adapt pannom, new tools introduce pannom, process streamline pannom, and in the future also, challenges varum, but namma team oda strength enna na, we don’t give up. Next, innovation pathi pesalaam — world-la technology speed romba fast-aa improve aagudhu, AI, Automation, Data Analytics — these are no longer buzzwords; they’re survival tools, and namma company already AI-based solutions implement pannittu irukku — internal workflow optimization, predictive analytics, and customer insights, and next year, we’re planning to expand our R&D team, explore Generative AI solutions, and improve digital infrastructure, and innovation-ku oru culture build panna vendiyadhu — ellarum contribute pannalaam, idea small or big nu illa — every idea matters. Ippo let’s look at the road ahead: next 3 years-la, namma aim pannirukkom: global presence expand pannradhu, especially Southeast Asia & Europe markets; sustainable growth strategy adopt pannradhu; customer experience elevate pannradhu; employee development programs strengthen pannradhu, and we will invest in learning, leadership development, and modern technology, because namma vision clear — “To be a world-class company known for innovation, quality, and people culture.” Friends, numbers and strategies are important — but namma success oda backbone enna na, our people; namma team-la irundha trust, support, and culture dhan namma differentiate pannudhu, and naan unga ellarukum oru message sollanum — never underestimate your impact, because oru idea, oru suggestion, oru effort — sometimes it can change the whole company direction, and ungaloda contribution illa na, namma intha level-ku varama irundhirukkum. Appo inime future pathi pesumbodhu, I want you all to see yourselves as leaders, not just employees, leaders of change, innovation, and excellence. In conclusion, let’s celebrate our success, learn from our challenges, embrace innovation, march forward with a clear vision, and together, namma oru extraordinary future build pannalaam, thank you once again for your time, commitment, and energy, and let’s continue to grow, innovate, and inspire. Vanakkam!"
      const summary = await this.gemini.getSummary(result)
      if (summary == 'Cannot generate a report: the content is too short.') {
        // await this.disk.delete(filePath)
        throw new Error(summary)
      }
      console.log('summary', summary)
      const organization_id = auth.user?.organization_id as number
      const organization = await Organization.query().where('id', organization_id)
      const meetingDetails = await this.meeting.checkMeeting(meetingid, organization_id)
      const pdfBuffer = await this.puppeteer.generateReport(meetingDetails, organization, summary)
      const pdfName = meetingDetails[0].title
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `attachment; filename=${pdfName}-report.pdf`)
      return response.send(pdfBuffer)
    } catch (error) {
      console.error('Bhashinis Error', error.message)
      return response.status(500).json({
        sucess: false,
        message: error.message.includes(500) ? 'The provided audio is too noisy or short. Please provide a clear or longer audio' : error.message
      })
    }
  }
}
