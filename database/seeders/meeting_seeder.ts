import Meeting from '#models/meeting'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    await Meeting.create({
      organization_id:1,
      title:'Zeekers Meeting Test',
      date:DateTime.local().startOf('day'),
      time:"3:00 PM",
      participants:"Name1,Name2,Name3"
    })
  }
}
