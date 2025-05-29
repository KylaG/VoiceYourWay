/**
 * This module exports functions which interact with Claude
 */


import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Send query to Claude.
 * @param {string} prompt : Prompt for Claude
 */
async function sendToClaude(prompt) {
  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [
        {"role": "user", "content": prompt}
      ]
  });

  if (response.type === "error") {
    return response.error.message;
  }
  
  return response.content[0].text;
}

export { sendToClaude }