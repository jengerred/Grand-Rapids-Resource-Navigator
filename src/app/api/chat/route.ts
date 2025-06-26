import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { type ChildProcess, exec as childExec } from 'child_process';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChatRequest {
  message: string;
  isSpanish: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChatResponse {
  response: string;
  error?: string;
}

// Rate limiting configuration
const rateLimit = {
  limit: 1, // requests per second
  lastRequest: 0
};

// In-memory cache for responses
const responseCache = new Map<string, string>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exec = promisify(childExec) as (command: string, options?: { env?: NodeJS.ProcessEnv }) => Promise<{ stdout: string; stderr: string; }>; // Properly typed promisified exec

export async function POST(request: Request) {
  console.log('=== START OF API REQUEST ===');
  
  try {
    const body = await request.json();
    console.log('Parsed request body:', body);

    if (!body) {
      console.error('No body received');
      return NextResponse.json(
        { error: 'Invalid request body', details: 'No body received' },
        { status: 400 }
      );
    }

    const { message, isSpanish } = body;
    
    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'No message provided', details: 'Message is required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const now = Date.now();
    if (now - rateLimit.lastRequest < 1000 / rateLimit.limit) {
      console.log('Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.', details: 'Too many requests' },
        { status: 429 }
      );
    }
    rateLimit.lastRequest = now;

    // Create cache key
    const cacheKey = `${message.toLowerCase()}_${isSpanish}`;
    console.log('Cache key:', cacheKey);

    // Check cache first
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Using cached response');
      return NextResponse.json({ response: cachedResponse });
    }

    // Pass the raw message to the Python script
    console.log('Message:', message);
    console.log('Language:', isSpanish ? 'Spanish' : 'English');

    // Run the Python script and capture its output
    try {
      console.log('=== START OF PYTHON SCRIPT EXECUTION ===');
      const pythonPath = process.env.PYTHON_PATH || 'python3';
      const scriptPath = process.env.PYTHON_SCRIPT_PATH || process.cwd() + '/src/lib/python/chat.py';
      
      console.log('Script path:', scriptPath);
      console.log('Environment variables:', {
        MESSAGE: message,
        IS_SPANISH: isSpanish ? 'true' : 'false'
      });

      const pythonProcess = spawn(pythonPath, [scriptPath], {
        env: {
          ...process.env,
          MESSAGE: message,
          IS_SPANISH: isSpanish ? 'true' : 'false'
        },
        stdio: ['pipe', 'pipe', 'pipe'] // Pipe all I/O
      }) as ChildProcess;

      let stdout = '';
      let stderr = '';

      if (pythonProcess.stdout) {
        pythonProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (pythonProcess.stderr) {
        pythonProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      await new Promise<void>((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          if (code !== 0) {
            reject(new Error(`Python script exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });

      console.log('=== PYTHON SCRIPT OUTPUT ===');
      console.log('Stdout:', stdout);
      console.log('Stderr:', stderr);
      console.log('=== END OF PYTHON SCRIPT OUTPUT ===');

      if (stderr) {
        console.error('Python script error:', stderr);
        return NextResponse.json(
          { 
            error: 'Error processing request',
            details: stderr
          },
          { status: 500 }
        );
      }

      try {
        // Extract just the JSON from stdout
        const lines = stdout.split('\n');
        let jsonLine = '';
        
        // Look for a line that contains valid JSON
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.trim());
            jsonLine = line;
            break;
          } catch (e) {
            // Not valid JSON, continue searching
          }
        }

        if (!jsonLine) {
          console.error('No valid JSON found in Python script output');
          console.error('Raw stdout:', stdout);
          return NextResponse.json(
            { 
              error: 'Error processing request',
              details: 'No valid JSON response from Python script'
            },
            { status: 500 }
          );
        }

        // Parse the JSON response
        console.log('=== RAW JSON LINE ===');
        console.log(jsonLine);
        console.log('=== END OF RAW JSON LINE ===');
        
        const pythonResponse = JSON.parse(jsonLine.trim());
        console.log('=== PARSED PYTHON RESPONSE ===');
        console.log(pythonResponse);
        console.log('=== END OF PARSED PYTHON RESPONSE ===');
        
        if (pythonResponse.error) {
          console.error('=== PYTHON SCRIPT ERROR ===');
          console.error('Error:', pythonResponse.error);
          console.error('Full response:', pythonResponse);
          console.error('=== END OF PYTHON SCRIPT ERROR ===');
          return NextResponse.json(
            { 
              error: 'Error processing request',
              details: pythonResponse.error
            },
            { status: 500 }
          );
        }

        const response = pythonResponse.response;
        
        // Cache the response
        if (response) {
          responseCache.set(cacheKey, response);
          console.log('Cached response:', response);
        }

        return NextResponse.json({ response });
      } catch (parseError) {
        console.error('Error parsing Python script response:', parseError);
        console.error('Raw response:', stdout);
        return NextResponse.json(
          { 
            error: 'Error processing request',
            details: 'Failed to parse response from AI service'
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error executing Python script:', error);
      return NextResponse.json(
        { error: 'Failed to execute Python script', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message || 'No message',
        name: error.name || 'Unknown error',
        stack: error.stack || 'No stack trace'
      });
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}