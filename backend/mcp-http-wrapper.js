// backend/mcp-http-wrapper.js
import express from 'express';
import { spawn } from 'child_process';
import 'dotenv/config';

const app = express();
const PORT = 3002;

// Store active connections
const connections = new Map();

app.get('/sse', (req, res) => {
  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });

  // Create unique connection ID
  const connId = Date.now().toString();
  
  // Spawn Cablate's MCP server
  const mcpProcess = spawn('npx', ['-y', '@cablate/mcp-google-map'], {
    env: { ...process.env, GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY }
  });

  connections.set(connId, { process: mcpProcess, res });

  // Forward stdout to SSE
  mcpProcess.stdout.on('data', (data) => {
    console.log("Data that we are trying to forward to HTTP:", data);
    res.write(`data: ${data.toString()}\n\n`);
  });

  // Forward stderr for debugging
  mcpProcess.stderr.on('data', (data) => {
    console.error(`MCP Error: ${data}`);
  });

  // Cleanup on disconnect
  req.on('close', () => {
    mcpProcess.kill();
    connections.delete(connId);
    console.log(`Client ${connId} disconnected`);
  });

  res.send('Testing Testing');
});

app.listen(PORT, () => {
  console.log(`MCP HTTP wrapper running at http://localhost:${PORT}/sse`);
});

// Cleanup on exit
process.on('SIGTERM', () => {
  connections.forEach(({ process }) => process.kill());
  process.exit(0);
});