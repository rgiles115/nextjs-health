import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define a type for the function parameters
type AnalysisRequest = {
  content: string;
  data: any; // Use a more specific type if possible
};

/**
 * Sends a message to OpenAI API.
 * @param params - The parameters containing content and data for analysis.
 * @returns The response from the OpenAI API.
 */
const sendMessageToOpenAI = async (params: AnalysisRequest) => {
  const { content, data } = params;
  const url = 'https://api.openai.com/v1/chat/completions';
  const OPENAPI_SECRET = process.env.OPENAPI_SECRET;
  const headers = {
    'Authorization': `Bearer ${OPENAPI_SECRET}`
  };
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
    const response = await axios.post(url, requestData, { headers: headers, timeout: 60000 });
    return response.data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { content, data } = req.body;

  try {
    const apiResponse = await sendMessageToOpenAI({ content, data });
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
}
