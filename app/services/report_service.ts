import env from '#start/env';
import puppeteer from 'puppeteer'
import view from 'edge.js'
import Meeting from '#models/meeting'
import Organization from '#models/organization'
export class PuppeteerService {
  async pageContent(meetingDetails: Meeting[], organization: Organization[], summary: string | undefined) {
    const pageContent = await view.render('report', {
      organizationName: organization[0].name,
      meetingTitle: meetingDetails[0].title,
      meetingDate: meetingDetails[0].date.toISODate(),
      meetingTime: meetingDetails[0].time,
      participants: meetingDetails[0].participants.split(',') || meetingDetails[0].participants,
      summary: summary,
    })
    return pageContent
  }
  async generateReport(meetingDetails: Meeting[], organization: Organization[], summary: string | undefined) {
    const browser = await puppeteer.launch({
      executablePath: env.get(' PUPPETEER_EXECUTABLE_PATH'),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    const pageContent = await this.pageContent(meetingDetails, organization, summary)
    await page.setContent(pageContent, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4' })
    return pdfBuffer
  }
}
