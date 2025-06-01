/**
 * This module exports functions which interact with Claude
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { Client, Language } from "@googlemaps/google-maps-services-js";
import 'dotenv/config';
import { DIRECTIONS_TOOL, GEOCODE_TOOL } from './tools.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const maps = new Client({
  apiKey: process.env.GOOGLE_MAPS_API_KEY
});

/**
 * Send query to Claude.
 * @param {string} prompt : Prompt for Claude
 * @param {boolean} useMCP : Whether to use MCP (optional, defaults to true)
 */
async function sendToClaude(prompt) {
  console.log("Send to Claude starting")
  const messages = [
    {"role": "user", "content": prompt}
  ];

  let response;
  do {
    response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      tools: [GEOCODE_TOOL, DIRECTIONS_TOOL],
      messages: messages
    });
    if (response.stop_reason === "tool_use") {
        // Add Claude's response with tool use to messages
        messages.push({
          "role": "assistant",
          "content": response.content
        });

      // Execute the tool and get results
      const toolResults = await executeTool(response);

      // Add tool results to messages
      messages.push({
        "role": "user",
        "content": toolResults.map(result => ({
          type: "tool_result",
          tool_use_id: result.tool_use_id,
          content: result.content
        }))
      });
    }
  }  while (response.stop_reason === "tool_use");

  return response;

  // const response = await anthropic.messages.create({
  //   model: "claude-3-7-sonnet-20250219",
  //     max_tokens: 1024,
  //     tools: [GEOCODE_TOOL, DIRECTIONS_TOOL],
  //     messages: [
  //       {"role": "user", "content": prompt}
  //     ]
  // });
  // if (response.stop_reason == "tool_use") {
  //   const result = executeTool(response);
  // }
  // // console.log(result); 
  // return response;
}

async function executeTool(response) {
  const toolResults = [];
  const toolUseId = response["content"].at(-1)["id"];
  const toolInput = response["content"].at(-1)["input"];

  let result;
  // console.log("printing in executeTool:", response["content"]["input"]);
  const tool = response["content"].at(-1)["name"];
  if (tool === "maps_geocode") {
    // const result = await maps_geocode(response["content"].at(-1)["input"]["address"]);
    result = await maps_geocode(toolInput["address"]);
  } else if (tool == "maps_directions"){
    result = await maps_directions(toolInput["origin"], toolInput["destination"], toolInput["mode"]);
  }

  toolResults.push({
    tool_use_id: toolUseId,
    content: JSON.stringify(result)
  });
  return toolResults;
}

async function maps_geocode(address) {
    let result;
    try {
      result = await maps.geocode({params: {address: address, key: process.env.GOOGLE_MAPS_API_KEY, language: Language.en}});
      // console.log("result in maps_geocode", result["data"]["results"][0])
    } catch (error) {
      console.error("Error in geocode:", error);
      throw new Error("An error occurred while converting the address coordinates");
    }
    return result["data"]["results"][0]["place_id"]

}

async function maps_directions(origin, destination, mode = 'driving') {
    let result;
    try {
      result = await maps.directions({
        params: {
          origin: origin,
          destination: destination,
          mode: mode,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      console.log("result in maps_directions", result["data"]);
      return result["data"];
    } catch (error) {
      console.error("Error in directions:", error);
      throw new Error("An error occurred while getting directions");
    }
}

export { sendToClaude }