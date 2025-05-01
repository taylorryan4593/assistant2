import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'
import { writeFileSync } from 'fs'
import path from 'path'
import os from 'os'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body

  const systemPrompt =
    "You are a helpful assistant specialized in the Matrixify Shopify app. You can generate CSV templates for Shopify imports, explain Matrixify errors, and guide users through Matrixify tasks. If asked for a spreadsheet, output it in pipe-separated table format."

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  })

  const output = completion.data.choices[0].message?.content || ''
  let csvUrl = null

  if (output.includes('|') && output.split('\n').length > 2) {
    try {
      const lines = output.trim().split('\n').filter(line => line.includes('|'))
      const rows = lines.map(line => line.split('|').map(cell => cell.trim()).filter(Boolean))
      const csvData = rows.map(row => row.join(',')).join('\n')

      const filename = `matrixify_${Date.now()}.csv`
      const filePath = path.join(os.tmpdir(), filename)
      writeFileSync(filePath, csvData)

      // For local dev: you could upload to a storage bucket and return a real URL
      csvUrl = null // Or your CDN logic here
    } catch (err) {
      console.error('CSV Parse Error', err)
    }
  }

  res.status(200).json({ text: output, csvUrl })
}
