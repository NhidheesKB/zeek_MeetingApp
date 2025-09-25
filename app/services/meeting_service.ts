import Meeting from '#models/meeting'
import { DateTime } from 'luxon'
export class MeetingService {
  async getMeeting(organization_id: number) {
    const meetings = await Meeting.query().where('organization_id', organization_id)
    return meetings.map((meeting) => {
      return {
        id: meeting.id,
        title: meeting.title,
        time: meeting.time,
        date: meeting.date.toLocaleString(),
        summary: meeting.summary,
        participants: meeting.participants,
      }
    })
  }
  async createMeeting(
    organization_id: number,
    title: string,
    time: string,
    date: DateTime,
    participants: string
  ) {
    return await Meeting.create({
      organization_id,
      title,
      date,
      time,
      participants: participants.toString(),
    })
  }
  async checkMeeting(id: number, organization_id: number) {
    return await Meeting.query().where('id', id).andWhere('organization_id', organization_id)
  }
}
