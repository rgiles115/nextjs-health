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

// Function to estimate the number of tokens in a string
function estimateTokenCount(text: string): number {
  // Rough approximation: average English word length + 1 space as a delimiter
  const averageWordLength = 5 + 1; 
  return Math.ceil(text.length / averageWordLength);
}

// Function to send a message to OpenAI API
const sendMessageToOpenAI = async (params: AnalysisRequest) => {
  const { content, data } = params;
  const url = 'https://api.openai.com/v1/chat/completions';
  const OPENAPI_SECRET = process.env.OPENAPI_SECRET;

  // Setting up the request payload for the OpenAI API
  const requestData = {
    model: 'gpt-4-turbo-preview', // Specifies the model to use
    messages: [
      { 
        "role": "user", 
        "content": `${content} ${JSON.stringify(data)}` 
      }
    ],
    max_tokens: 1000, // Sets the maximum number of tokens in the response
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
  const body = await req.json();
  const { content, data } = body;

  // Convert content and data to a string as it will be sent to the API
  const combinedText = `${content} ${JSON.stringify(data)}`;
  const estimatedTokens = estimateTokenCount(combinedText);

  // Check if the estimated token count exceeds the limit (e.g., 4096 tokens for GPT-4)
  if (estimatedTokens > 2096) { // Adjust the limit based on your model's specific limits
    const errorMessage = "The amount of data to analyse is too large. Reduce the date window and please try again.";
    console.error(errorMessage); // Log the specific error message for server-side visibility
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const apiResponse = await sendMessageToOpenAI({ content, data });
    return new Response(JSON.stringify(apiResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    return new Response(JSON.stringify({ message: error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}