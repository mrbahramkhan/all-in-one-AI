export async function GET() {
  try {
    const backendHealth = await fetch('http://localhost:3001/api/v1/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()).catch(() => ({ status: 'down' }));

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      frontend: 'running',
      backend: backendHealth.status || 'unknown',
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
