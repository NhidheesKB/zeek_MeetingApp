import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    const hashpassowrd=await hash.make('admin@zeekers')
    const data={
      organization_id:1,
      username:'zeekers',
      email:'admin@zeekerstech.in',
      password:hashpassowrd,
      created_at:db.raw('CURRENT_TIMESTAMP'),
      updated_at:db.raw('CURRENT_TIMESTAMP')
    }
    await db.table('users').insert(data)
  }
}
