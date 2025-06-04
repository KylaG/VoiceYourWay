// Tool definitions for Claude API integration

export const routeMatrixTool = {
  name: "compute_route_matrix",
  description:
    "Compute travel times and distances between multiple origins and destinations. This tool is useful for comparing route options, finding the closest/fastest destinations from multiple starting points, or analyzing travel patterns between multiple locations. Returns a matrix showing duration and distance for each origin-destination pair.",
  input_schema: {
    type: "object",
    properties: {
      origins: {
        type: "array",
        description: "Array of starting locations (addresses or place names)",
        items: {
          type: "string",
          description: "Origin location as address or place name (e.g., 'Seattle, WA' or 'Space Needle, Seattle')"
        },
        minItems: 1,
        maxItems: 25
      },
      destinations: {
        type: "array",
        description: "Array of destination locations (addresses or place names)",
        items: {
          type: "string",
          description: "Destination location as address or place name (e.g., 'Portland, OR' or 'Pike Place Market, Seattle')"
        },
        minItems: 1,
        maxItems: 25
      },
    },
    required: ["origins", "destinations"]
  }
};

export const searchPlacesTool = {
  name: "search_places",
  description:
    "Search for places using Google Maps. Use this tool to find specific locations, businesses, landmarks, or addresses when you need to identify exact places for route planning or location queries. The result of this tool will be an object containing the official name and address of the place.",
  input_schema: {
    type: "object",
    properties: {
      search_query: {
        type: "string",
        description:
          "A natural language search query for finding places (e.g., 'coffee shops near downtown Seattle', 'Golden Gate Bridge', 'closest gas station')",
      },
    },
    required: ["search_query"],
  },
};

export const getPolylineTool = {
  name: "get_polyline",
  description:
    "Generate a route polyline between two locations. This creates an encoded route string that represents the path from origin to destination, which is needed for mapping and navigation purposes.",
  input_schema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description:
          "The starting location with name and address (e.g., 'Starbucks, 123 Main St, Seattle WA'). If not provided, will use current location as starting point.",
      },
      destination: {
        type: "string",
        description:
          "The ending location with name and address (e.g., 'Space Needle, 400 Broad St, Seattle WA')",
      },
    },
    required: ["destination"],
  },
};

export const searchAlongRouteTool = {
  name: "search_along_route",
  description: "Search for places along a specific route. This tool finds businesses, landmarks, or services (like gas stations, restaurants, hotels) that are located along the path between two points. You should use this tool whenever the user asks you for a navigation query that includes an intermediate stop. You must first use get_polyline tool to obtain the route polyline before using this tool.",
  input_schema: {
    type: "object",
    properties: {
      search_query: {
        type: "string",
        description: "A natural language search query for places you want to find along the route (e.g., 'gas stations', 'restaurants', 'rest stops', 'hotels')"
      },
      route: {
        type: "string",
        description: "The encoded polyline string representing the route. This must be obtained from a previous call to the get_polyline tool."
      }
    },
    required: ["search_query", "route"]
  }
};

export const formatTool = {
  name: "format_tool",
  description:
    "FINAL STEP: Format the complete route information after all places have been identified and validated. Use this tool only after you have gathered all necessary location details using the other tools. This structures the final route with origin, destination, and any intermediate stops.",
  input_schema: {
    type: "object",
    properties: {
      origin: {
        type: "object",
        description: "The starting location details",
        properties: {
          name: {
            type: "string",
            description: "The name of the starting place",
          },
          address: {
            type: "string",
            description: "The full address of the starting place",
          },
        },
        required: ["name", "address"],
      },
      destination: {
        type: "object",
        description: "The ending location details",
        properties: {
          name: {
            type: "string",
            description: "The name of the destination place",
          },
          address: {
            type: "string",
            description: "The full address of the destination place",
          },
        },
        required: ["name", "address"],
      },
      stops: {
        type: "array",
        description:
          "Intermediate stops along the route (can be empty if direct route)",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the stop location",
            },
            address: {
              type: "string",
              description: "The full address of the stop location",
            },
          },
          required: ["name", "address"],
        },
      },
    },
    required: ["origin", "destination", "stops"],
  },
};

// export const GEOCODE_TOOL = {
//     name: "maps_geocode",
//     description: "Convert address to coordinates",
//     input_schema: {
//         type: "object",
//         properties: {
//             address: {
//                 type: "string",
//                 description: "The address we will convert to coordinates, e.g. 121 Campus Drive",
//             },
//         },
//         required: ["address"],
//     },
// };

// export const DIRECTIONS_TOOL = {
//     name: "maps_get_polyline",
//     description: "Get the polyline string which represents a route between two places.",
//     input_schema: {
//     type: "object",
//     properties: {
//       origin: {
//         type: "string",
//         description: "The location where you want to start. This can be any string a navigation system like Google Maps would understand.",
//       },
//       destination: {
//         type: "string",
//         description: "The location of where you want to go. This can be any string a navigation system like Google Maps would understand.",
//       },
//       mode: {
//         type: "string",
//         enum: ["driving", "walking", "bicycling", "transit"],
//         description: "Mode of transportation to get to destination.",
//         default: "driving",
//       },
//       departure_time: {
//         type: "string",
//         description: "When you are leaving from your origin.",
//         default: new Date().toISOString(),
//       },
//       arrival_time: {
//         type: "string",
//         description: "When you are arrive at your destination.",
//       },
//     },
//     required: ["origin", "destination"],
//   },
// };

// export const NAVIGATION_URL_TOOL = {
//   name: "navigation_url_tool",
//   description: `This tool provides a Google Maps link for navigation from the
//   indicated origin to indicated destination. When the user asks for
//   directions, this tool should be used as the final step whenever the user asks
//   for directions or navigation as a way to provide the
//   user with a direct link to their desired route. The first parameter is the origin
//   of the route. It should be a string which you'd enter into a navigation system to
//   indicate the starting point of the route. The second parameter is the destination.
//   It should be a string which you'd enter into a navigation system to indicate the end
//   of a route.`,
//   input_schema: {
//     type: "object",
//     properties: {
//       origin: {
//         type: "string",
//         description: `The place where the route begins. The format should be
//         something that would be recognized by a navigation system like Google Maps.`
//       },
//       destination: {
//         type: "string",
//         description: `The place where the route ends. The format should be
//         something that would be recognized by a navigation system like Google Maps.`
//       },
//       waypoints: {
//         type: "array",
//         description: `Any places where we'd like to make a stop along the way. You must
//         include stops in this array if the user asks for any stops on their route. The
//         format should be something that would be recognized by a navigation system
//         like Google Maps. This array can be empty if the user has not requested
//         any stops.`
//       }
//     },
//     required: ["origin", "destination", "waypoints"]
//   }
// };

// export const SEARCH_ALONG_ROUTE = {
//   name: "search_along_route",
//   description: `This tool allows you to search Google Maps for places based on a text query.
//   It will search for places near the provided route. The route should be provided as an argument
//   to this tool. The route should be passed as a polyline. The polyline can be obtained by using
//   the maps_get_polyline tool.`,
//   input_schema: {
//     type: "object",
//     properties: {
//       query: {
//         type: "string",
//         description: `A query representing what we would like to find along the main route.
//         This could be anything that would be recognized by a navigation system like Google Maps.`
//       },
//       route: {
//         type: "string",
//         description: `The polyline representing the main route. The polyline can be obtained by using
//         the maps_directions tool and using the overview_polyline field in the result.`,
//         // default: "i{teF|``jVC@[XMLs@l@QP[VIFWT]Z[Z}@t@SPg@h@{@t@e@`@A@A?GFCBCBKHg@b@CBKHGFGDIHQNGFURo@h@MJs@n@g@b@UPQL[PQN_@Zk@f@a@\\w@p@WTGFURg@b@YTMJ]XONa@\\IHq@j@_BrAm@j@EBuBhB}@v@]XSRaAz@WRGFi@l@QRCDMPIJ[d@SZORk@z@QZOTEHMRILSXu@hAgAdBUb@GPa@|@[v@Qb@"
//       },
//     },
//     required: ["query", "route"]
//   }
// };

// /*

// {
//   "name": "get_weather",
//   "description": "Get the current weather in a given location",
//   "input_schema": {
//     "type": "object",
//     "properties": {
//       "location": {
//         "type": "string",
//         "description": "The city and state, e.g. San Francisco, CA"
//       },
//       "unit": {
//         "type": "string",
//         "enum": ["celsius", "fahrenheit"],
//         "description": "The unit of temperature, either 'celsius' or 'fahrenheit'"
//       }
//     },
//     "required": ["location"]
//   }
// }

// */
