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
    const { prompt } = req.body;
    console.log("Request:", prompt);

    // Validate that prompt exists
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Invalid prompt.",
      });
    }

    // This should be a URL
    const response = await sendToClaude(prompt);
    
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
  console.log(`Example app listening on port ${port}`);
});