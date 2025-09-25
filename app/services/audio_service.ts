import Ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { Readable } from 'stream'
import axios from 'axios'
import { promises as fs } from 'fs'
import env from '#start/env'
Ffmpeg.setFfmpegPath(ffmpegPath.path)
export class AudioService {
  private callbackUrl
  private langUrl
  constructor() {
    this.callbackUrl = env.get('CALLBACKURL') as string
    this.langUrl = env.get('LANG_URL') as string
  }
  async toWavFormat(path: string): Promise<Buffer> {
    const audioBuffer = await fs.readFile(path)
    const inputstream = new Readable()
    inputstream.push(audioBuffer)
    inputstream.push(null)
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const outstream = Ffmpeg(inputstream)
        .inputFormat('webm')
        .audioCodec('pcm_s16le')
        .format('wav')
        .audioFrequency(16000)
        .on('end', () => {
          const wavbuffer = Buffer.concat(chunks)
          resolve(wavbuffer)
        })
        .on('error', (err) => {
          console.log('error during conversion', err)
          reject(err)
        })
        .pipe()
      outstream.on('data', (chuck) => chunks.push(chuck))
    })
  }
  async detectLanguage(url: string) {
    const payload = {
      pipelineTasks: [
        {
          taskType: 'audio-lang-detection',
          config: {
            serviceId: 'bhashini/iitmandi/audio-lang-detection/gpu',
          },
        },
      ],
      inputData: {
        audio: [
          {
            audioUri: url,
          },
        ],
      },
    }
    const response = await axios.post(this.langUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': env.get('AUTHPARAMETER'),
      },
    })
    const audiores = response.data.pipelineResponse
    return audiores.find((item: Record<string, string>) => item.taskType == 'audio-lang-detection')
      .output[0].langPrediction[0].langCode
  }
  async toTranslatedText(url: string, langcode: string) {
    const payload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: {
              sourceLanguage: langcode,
            },
            serviceId: 'bhashini/ai4bharat/conformer-multilingual-asr',
            audioFormat: 'wav',
            samplingRate: 16000,
            preProcessor: ['vad', 'denoiser'],
            postProcessors: ['itn', 'punctuation'],
          },
        },
        {
          taskType: 'translation',
          config: {
            language: {
              sourceLanguage: langcode,
              targetLanguage: 'en',
            },
            serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4',
          },
        },
        {
          taskType: 'tts',
          config: {
            language: {
              sourceLanguage: 'en',
            },
            serviceId: 'Bhashini/IITM/TTS',
            gender: 'male',
          },
        },
      ],
      inputData: {
        audio: [{ audioUri: url }],
      },
    }
    const response = await axios.post(this.callbackUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': env.get('AUTHPARAMETER'),
      },
    })
    const finalresponse = response.data.pipelineResponse
    const translationresponse = finalresponse.find(
      (item: Record<string, string>) => item.taskType == 'translation'
    )
    return translationresponse.output[0].target
  }
}
