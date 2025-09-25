import { MeetingService } from '#services/meeting_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DashboardController {
  constructor(private meeting: MeetingService) {}
  public async dashboard({ response, auth, inertia }: HttpContext) {
    if (!auth.isAuthenticated || !auth.user?.organization_id) {
      return response.redirect().toRoute('login')
    }
    try {
      const organization_id = auth.user.organization_id
      const meetings = await this.meeting.getMeeting(organization_id)
      console.log('upcoo', meetings)
      return inertia.render('allMeeting', {
        meetings,
      })
    } catch (error) {
      console.error('dashboardCOntrollerError', error)
    }
  }
}
