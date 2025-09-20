import Meeting from '#models/meeting'

export class DashboardService {
  async getMeeting(organization_id:number) {
    return await Meeting.query().where('organization_id', organization_id)
  }
}
