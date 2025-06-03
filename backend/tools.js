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

export const NAVIGATION_URL_TOOL = {
  name: "navigation_url_tool",
  description: `This tool provides a Google Maps link for navigation from the
  indicated origin to indicated destination. When the user asks for
  directions, this tool should be used as the final step whenever the user asks 
  for directions or navigation as a way to provide the
  user with a direct link to their desired route. The first parameter is the origin
  of the route. It should be a string which you'd enter into a navigation system to
  indicate the starting point of the route. The second parameter is the destination.
  It should be a string which you'd enter into a navigation system to indicate the end
  of a route.`,
  input_schema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: `The place where the route begins. The format should be
        something that would be recognized by a navigation system like Google Maps.`
      },
      destination: {
        type: "string",
        description: `The place where the route ends. The format should be
        something that would be recognized by a navigation system like Google Maps.`
      },
      waypoints: {
        type: "array",
        description: `Any places where we'd like to make a stop along the way. The
        format should be something that would be recognized by a navigation system
        like Google Maps. This array can be empty if the user has not requested
        any stops.`
      }
    },
    required: ["origin", "destination", "waypoints"]
  }
}

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