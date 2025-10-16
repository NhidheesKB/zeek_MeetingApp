import drive from '@adonisjs/drive/services/main'
export class DiskService {
  private disk
  constructor() {
    this.disk = drive.use('s3')
  }
  async getUrl(wavBuffer: Buffer) {
    const filePath = `service-notes/meetingRecordAt-${Date.now()}.wav`
    await this.disk.put(filePath, wavBuffer)
    const url = await this.disk.getSignedUrl(filePath, { expiresIn: "30mins" })
    return { url, filePath }
  }
  async delete(filePath: string) {
    await this.disk.delete(filePath)
  }
}
