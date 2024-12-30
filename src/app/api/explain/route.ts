import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client outside the handler to avoid recreating it on every request
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { code, detailLevel } = await req.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Adjust the system prompt based on detail level
    const detailPrompt = getDetailLevelPrompt(detailLevel);

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: detailPrompt
        },
        {
          role: "user",
          content: code
        }
      ],
      stream: false
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('Invalid response from API');
    }

    return NextResponse.json({ 
      explanation: response.choices[0].message.content 
    });
  } catch (error) {
    if (error.code === 'invalid_request_error' && error.status === 402) {
      return NextResponse.json(
        { error: 'Insufficient Balance. Please check your account balance.' },
        { status: 402 }
      );
    }
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to explain code: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

function getDetailLevelPrompt(detailLevel: string): string {
  switch (detailLevel) {
    case 'brief':
      return "You are a coding assistant. Provide a brief, concise explanation of the following code.";
    case 'detailed':
      return "You are a coding assistant. Provide a detailed explanation of the following code, including its purpose, functionality, potential edge cases, and possible improvements.";
    default: // medium
      return "You are a coding assistant. Please explain the following code in detail, including its purpose and functionality.";
  }
}