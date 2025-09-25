import User from '#models/user'
import { MeetingService } from '#services/meeting_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class MeetinghandlersController {
  constructor(private meeting:MeetingService){}
  public async handleMeeting({ request, response, inertia, auth }: HttpContext) {
    const meetingid= request.input('meetingid') as number
    if (!meetingid) {
      return inertia.render('meeting')
    }
    try {
      const { organization_id } = auth.user as User
      const isMeeting=await this.meeting.checkMeeting(meetingid,organization_id)
      if(isMeeting.length==0)return response.redirect().toRoute('dashboard')
      return inertia.render('meetingRecorder',{meetingid})
    } catch (error) {
      console.error('MeetingHandlerError', error)
    }
  }
}
