// Edge Function configuration
// This code sets up an edge function that processes requests, sends them
// to the OpenAI API, and returns the response. It's designed to handle JSON
// data, which it receives and sends. The function sendMessageToOpenAI is
// the core where the API call is made, and the handler function acts as the
// serverless function entry point, handling incoming requests and responses. 

export const config = {
  runtime: 'edge',
};

import axios from 'axios';

// Define a type for the function parameters
type AnalysisRequest = {
  content: string;
  data: any; // Consider using a more specific type if possible
};

// Function to send a message to OpenAI API
const sendMessageToOpenAI = async (params: AnalysisRequest) => {
  const { content, data } = params;
  const url = 'https://api.openai.com/v1/chat/completions';
  const OPENAPI_SECRET = process.env.OPENAPI_SECRET;

  // Setting up the request payload for the OpenAI API
  const requestData = {
    model: 'gpt-4', // Specifies the model to use (GPT-4 in this case)
    messages: [
      { 
        "role": "user", 
        "content": `${content} ${JSON.stringify(data)}` 
      }
    ],
    max_tokens: 300, // Sets the maximum number of tokens in the response
    temperature: 0.7 // Sets the creativity of the response
  };

  try {
    // Making a POST request to the OpenAI API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAPI_SECRET}`, // Authorization header with API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Checking if the response from the API is okay
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Returning the JSON response from the API
    return await response.json();
  } catch (error) {
    // Logging and throwing any errors encountered during the API call
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

// Edge Function handler
export default async function handler(req: Request) {
  // Parsing the JSON body from the request
  const body = await req.json();
  const { content, data } = body;

  try {
    // Calling the sendMessageToOpenAI function with the request body
    const apiResponse = await sendMessageToOpenAI({ content, data });
    // Sending the API response back to the client
    return new Response(JSON.stringify(apiResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Sending an error response in case of any issues
    return new Response(JSON.stringify({ message: "An error occurred while processing your request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
