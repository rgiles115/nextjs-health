// Edge Function configuration
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

  const requestData = {
    model: 'gpt-4',
    messages: [
      { 
        "role": "user", 
        "content": `${content} ${JSON.stringify(data)}` 
      }
    ],
    max_tokens: 200,
    temperature: 0.7
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAPI_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};


// Edge Function handler
export default async function handler(req: Request) {
  const body = await req.json();
  const { content, data } = body;

  try {
    const apiResponse = await sendMessageToOpenAI({ content, data });
    return new Response(JSON.stringify(apiResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "An error occurred while processing your request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
