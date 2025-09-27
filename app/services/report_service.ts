import env from '#start/env';
import puppeteer from 'puppeteer';

export class PuppeteerService {
  async generateReport(pageContent:string){
    const browser=await puppeteer.launch({
      executablePath:env.get(' PUPPETEER_EXECUTABLE_PATH'),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page=await browser.newPage()
    await page.setContent(pageContent,{waitUntil:'networkidle0'})
    const pdfBuffer=await page.pdf({format:'A4'})
    return pdfBuffer
  }
}
