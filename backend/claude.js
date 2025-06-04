/**
 * This module exports functions which interact with Claude
 */

/**
 * @typedef {Object} Place
 * @property {string} name
 * @property {string} address
 */

import { Anthropic } from "@anthropic-ai/sdk";
import { Client, Language } from "@googlemaps/google-maps-services-js";
import "dotenv/config";
import {
  searchPlacesTool,
  searchAlongRouteTool,
  getPolylineTool,
  formatTool,
} from "./tools.js";
import { PlacesClient } from "@googlemaps/places";
import { SYSTEM_PROMPT } from "./system_prompt.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const maps = new Client({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

/**
 * Send query to Claude and provide Claude tools to respond to the query.
 * This should return a URL which is a link to a Google Maps route.
 * @param {string} prompt : Prompt for Claude
 */
async function sendToClaude(prompt) {
  console.log("Send to Claude starting.");
  const messages = [{ role: "user", content: prompt }];

  let response;
  do {
    response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 10024,
      tools: [
        searchPlacesTool,
        getPolylineTool,
        searchAlongRouteTool,
        formatTool,
      ],
      system: SYSTEM_PROMPT,
      messages: messages,
    });
    if (response.stop_reason === "tool_use") {
      // Add Claude's response with tool use to messages
      console.log("Claude is stopping for tool use.");
      messages.push({
        role: "assistant",
        content: response.content,
      });

      // Execute the tool and get results
      const tool = response["content"].at(-1)["name"];
      if (tool === "format_tool") {
        // Extract the formatted output from Claude's tool use
        const output_object = response["content"].at(-1)["input"];
        const url = getMapsUrl(
          output_object["origin"],
          output_object["destination"],
          output_object["stops"]
        );
        console.log(`getMapsUrl(${JSON.stringify(output_object)}) returned ${url}`);
        return url;
      }
      const toolResults = await executeTool(response);

      // Add tool results to messages
      messages.push({
        role: "user",
        content: toolResults.map((result) => ({
          type: "tool_result",
          tool_use_id: result.tool_use_id,
          content: result.content,
        })),
      });
    }
  } while (response.stop_reason === "tool_use");

  throw new Error("Please specify your origin and destination for your trip.");
}

async function executeTool(response) {
  const toolResults = [];
  const toolUseId = response["content"].at(-1)["id"];
  const toolInput = response["content"].at(-1)["input"];

  let result;
  const tool = response["content"].at(-1)["name"];
  if (tool === "search_places") {
    result = await searchPlaces(toolInput["search_query"]);
  } else if (tool === "get_polyline") {
    result = await getPolyline(toolInput["origin"], toolInput["destination"]);
  } else if (tool === "search_along_route") {
    result = await searchAlongRoute(
      toolInput["search_query"],
      toolInput["route"]
    );
  }

  toolResults.push({
    tool_use_id: toolUseId,
    content: JSON.stringify(result),
  });
  return toolResults;
}

/**
 * @param {string} origin 
 * @param {string} destination 
 * @param {string} mode {"driving", "walking", etc.}
 * @returns string (a polyline)
 */
async function getPolyline(origin, destination, mode = "driving") {
  console.log(`Claude called getPolyline("${origin}", "${destination})`);
  let result;
  try {
    result = await maps.directions({
      params: {
        origin: origin,
        destination: destination,
        mode: mode,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const output = result["data"]["routes"][0]["overview_polyline"]["points"];
    return output;
  } catch (error) {
    console.error("Error in getPolyline:", error);
    throw new Error("An error occurred in getPolyline.");
  }
}

/**
 * @param {string} query 
 * @returns Place
 */
async function searchPlaces(query) {
  const request = {
    textQuery: query,
  };
  const response = await placesClient.searchText(request, {
    otherArgs: {
      headers: {
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
      },
    },
  });
  const name = response[0]["places"][0]["displayName"]["text"];
  const address = response[0]["places"][0]["formattedAddress"];
  const result = { name: name, address: address };
  console.log(`searchPlaces(${query}) returned ${result}`);
  return result;
}

/**
 * @param {Place} origin 
 * @param {Place} destination 
 * @param {Place[]} stops 
 * @returns string (a URL)
 */
function getMapsUrl(origin, destination, stops) {
  const format_string = (place_object) => {
    return `${place_object["name"]}, ${place_object["address"]}`;
  };
  const baseUrl = "https://www.google.com/maps/dir/";
  const url = new URL(baseUrl);
  url.searchParams.append("api", "1");
  url.searchParams.append("origin", format_string(origin));
  url.searchParams.append("destination", format_string(destination));
  if (stops.length > 0) {
    let waypointString = "";
    for (let i = 0; i < stops.length; i++) {
      waypointString += format_string(stops[i]);
      if (i < stops.length - 1) {
        waypointString += "|";
      }
    }
    url.searchParams.append("waypoints", waypointString);
  }
  url.searchParams.append("mode", "driving");
  return url.toString();
}

/**
 * @param {string} query 
 * @param {string} route (A polyline)
 * @returns Place
 */
async function searchAlongRoute(query, route) {
  const request = {
    textQuery: query,
    searchAlongRouteParameters: {
      polyline: {
        encodedPolyline: route,
      },
    },
  };
  const response = await placesClient.searchText(request, {
    otherArgs: {
      headers: {
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
      },
    },
  });
  const name = response[0]["places"][0]["displayName"]["text"];
  const address = response[0]["places"][0]["formattedAddress"];
  const result = { name: name, address: address };
  console.log(`searchAlongRoute("${query}") returned ${result}`);
  return result;
}

export { sendToClaude };
