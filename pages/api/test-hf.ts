import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to call the Hugging Face API
async function queryHuggingFace(question: string, context: string) {
  console.log('Sending request to model...');
  
  // Using a question-answering model
  const MODEL_ID = "deepset/roberta-base-squad2";
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          question: question,
          context: context
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Sending request to Hugging Face...');
    
    console.log('Testing question answering...');
    
    const context = "Food banks typically provide food assistance, clothing, and sometimes shelter to those in need. They may also offer job training and other support services.";
    const question = "What services do food banks typically provide?";
    
    console.log(`Question: ${question}`);
    console.log(`Context: ${context}`);
    
    const result = await queryHuggingFace(question, context);
    
    console.log('Raw response:', JSON.stringify(result, null, 2));
    
    res.status(200).json({
      success: true,
      response: result,
      question: question,
      context: context
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error:', error);
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      help: 'Check the server logs for more details'
    });
  }
}
