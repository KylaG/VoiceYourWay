export const GEOCODE_TOOL = {
    name: "maps_geocode",
    description: "Convert address to coordinates",
    input_schema: {
        type: "object",
        properties: {
            address: {
                type: "string",
                description: "The address we will convert to coordinates, e.g. 121 Campus Drive",
            },
        },
        required: ["address"],
    },
};

export const DIRECTIONS_TOOL = {
    name: "maps_directions",
    description: "Get turn-by-turn navigation between two points",
    input_schema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "The point where you want to start.",
      },
      destination: {
        type: "string",
        description: "The location of where you want to go.",
      },
      mode: {
        type: "string",
        enum: ["driving", "walking", "bicycling", "transit"],
        description: "Mode of transportation to get to destination.",
        default: "driving",
      },
      departure_time: {
        type: "string",
        description: "When you are leaving from your origin.",
        default: new Date().toISOString(),
      },
      arrival_time: {
        type: "string",
        description: "When you are arrive at your destination.",
      },
    },
    required: ["origin", "destination"],
  },
};

/*

{
  "name": "get_weather",
  "description": "Get the current weather in a given location",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state, e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "The unit of temperature, either 'celsius' or 'fahrenheit'"
      }
    },
    "required": ["location"]
  }
}

*/