import { geminiai } from '#config/geminiconfig'

export class GeminiService {
  private prompt
  constructor() {
    this.prompt = `
You are a professional meeting summarizer.
You will be provided with the meeting transcript (possibly translated from another language).
Some minor translation errors or typos may exist. Ignore them and focus on extracting the meaning.

You are a professional meeting summarizer.

Instructions:
1. Summarize the meeting transcript provided in clear, concise, and professional English.
2. Include key points, decisions made, action items, and participants if mentioned.
3. If the transcript is too short or does not contain sufficient content to generate a meaningful summary,
   respond exactly with: "Cannot generate a report: the content is too short."


Transcript to summarize:`
  }
  async getSummary(content: string) {
    const response = await geminiai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'system',
        text: `${this.prompt}${content} Provide the output as a coherent paragraph or bullet points if needed.`,
      },
    })
    // console.log('Text', response.text)
    return response.text
  }
}
