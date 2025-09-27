import puppeteer from 'puppeteer';

export class PuppeteerService {
  async generateReport(pageContent:string){
    const browser=await puppeteer.launch()
    const page=await browser.newPage()
    await page.setContent(pageContent,{waitUntil:'networkidle0'})
    const pdfBuffer=await page.pdf({format:'A4'})
    return pdfBuffer
  }
}
