import express, { json } from 'express'
import 'dotenv/config';
import { sendToClaude } from './claude.js'
import { Client, Language } from "@googlemaps/google-maps-services-js";
import { PlacesClient } from "@googlemaps/places";
import { writeFile } from "fs/promises";

const app = express()
const port = 3000

app.use(json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("PROMPT TO CLAUDE", prompt);
    
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

// Try out the searchAlongRoute API call

async function testing() {
  console.log("Testing...");
  const maps = new Client({
    apiKey: process.env.GOOGLE_MAPS_API_KEY
  });

  // Get the polyline
  const origin = "Jones Beach";
  const destination = "Northport Village";
  let polyline;
  try {
    console.log("Making Directions request...");
    let result = await maps.directions({
      params: {
        origin: origin,
        destination: destination,
        mode: "driving",
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    polyline = result["data"]["routes"][0]["overview_polyline"]["points"];
    console.log(`Polyline between ${origin} and ${destination} is ${polyline}`);
  } catch (error) {
    console.error("Error in 'directions' call when getting polyline.", error);
    throw new Error("An error occurred while getting directions");
  }
  
  // Make searchAlongRoute request
  const placesClient = new PlacesClient({
    apiKey: process.env.GOOGLE_MAPS_API_KEY 
  });
  const query = "gas";
  const request = {
    textQuery: query,
    searchAlongRouteParameters: {
      polyline: {
        encodedPolyline: polyline 
      }
    }
  };
  console.log("Making searchAlongRoute request...");
  const response = await placesClient.searchText(request, {
    otherArgs: {
      headers: {
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
      },
    },
  });
  await writeFile("searchAlongRouteResponse.json", JSON.stringify(response, null, 2));
  console.log("Wrote response to file.");
  
}

// testing();
