import { DashboardService } from '#services/dashboard_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DashboardController {
  constructor(private dashboardService: DashboardService) {}
  public async Dashboard({ response, auth, inertia }: HttpContext) {
    if (!auth.isAuthenticated || !auth.user?.organization_id) {
      return response.redirect().toRoute('login')
    }
    const organization_id = auth.user.organization_id
    try {
      const upcomming_Meetings = (await this.dashboardService.getMeeting(organization_id)).at(0)
      console.log('upcoo', upcomming_Meetings)
      return inertia.render('home', {
        title: upcomming_Meetings?.title,
        time: upcomming_Meetings?.time,
        date: upcomming_Meetings?.date,
        participants: upcomming_Meetings?.participants,
      })
    } catch (error) {
      console.error('dashboardCOntrollerError', error)
    }
  }
}
