import express, { json } from 'express'
import cors from 'cors';
import 'dotenv/config';
import { sendToClaude } from './claude.js'

const app = express()
const port = 3000

app.use(cors());
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
    
    // Check if this is a user-facing error message (from our validation)
    if (error.message && (
      error.message.includes('specify both an origin and destination') ||
      error.message.includes('Please specify your') ||
      error.message.includes("couldn't understand your request") ||
      error.message.includes('for the trip')
    )) {
      res.status(400).json({
        error: error.message
      })
    } else {
      // For other errors, send the actual error message instead of generic message
      res.status(500).json({
        error: error.message || 'Internal server error while processing prompt'
      })
    }
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});