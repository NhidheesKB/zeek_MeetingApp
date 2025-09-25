import { MeetingService } from '#services/meeting_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class NewMeetingsController {
  constructor(private meeting: MeetingService) {}
  public async newMeeting({ request, response, auth }: HttpContext) {
    const { title, date, time, participants } = request.body()
    try {
      const organization_id = auth.user?.organization_id as number
      const createMeeting = await this.meeting.createMeeting(
        organization_id,
        title,
        time,
        date,
        participants
      )
    } catch (error) {
      console.error("New Meeting Controller Error",error)
    }
  }
}
