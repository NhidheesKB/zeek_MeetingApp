import vine from '@vinejs/vine'

export const audio_validator=vine.compile(
  vine.object({
    recorder:vine.file({
      extnames:['webm'],
    }),
    meetingid:vine.number()
  })
)
