import Organization from '#models/organization'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Organization.create({
      name:'Zeekers Technology Solutions and Pvt Ltd',
    })
  }
}
