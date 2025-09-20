import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Meeting extends BaseModel {
  public static table='meetings'
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare organization_id: number
  @belongsTo(() => Organization, {
    foreignKey: 'organization_id',
    localKey: 'id',
  })
  declare Organization: BelongsTo<typeof Organization>
  @column()
  declare title: string
  @column.date()
  declare date: DateTime
  @column()
  declare time: string
  @column()
  declare participants: string
  @column()
  declare summary: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
