import express, { json } from 'express'
import 'dotenv/config';
import { sendToClaude } from './claude.js'


const app = express()
const port = 3000

app.use(json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/prompt', async (req, res) => {
  try {
    const { prompt } = req.body
    console.log("PROMPT TO CLAUDE", prompt)
    
    // Validate that prompt exists
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid prompt.'
      })
    }
    
    const response = await sendToClaude(prompt);
    // console.log("Response from Claude:", response);
    // console.log("Content:", response["content"].at(-1)["input"]["address"]);
    // console.log(response.content[content.length() - 1].input)
    
    // Return the response
    res.json({
      prompt: prompt,
      response: response,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error processing prompt:', error)
    res.status(500).json({
      error: 'Internal server error while processing prompt'
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
