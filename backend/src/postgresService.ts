import net from 'net';

// Dynamically import EmbeddedPostgres
const EmbeddedPostgres = require('embedded-postgres').default || require('embedded-postgres');

let pgInstance: any = null;

export async function isPortOpen(port: number = 5432): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

export async function ensurePostgresRunning(port: number = 5432): Promise<void> {
  const open = await isPortOpen(port);
  if (open) {
    console.log(`[POSTGRES] PostgreSQL is active and listening on port ${port}`);
    return;
  }

  console.log(`[POSTGRES] Starting local PostgreSQL engine on port ${port}...`);
  pgInstance = new EmbeddedPostgres({
    port,
    user: 'postgres',
    password: 'postgrespassword',
    database: 'nmit_hack_league',
    persistent: true,
  });

  try {
    await pgInstance.initialise();
  } catch (e) {
    // Already initialized
  }

  await pgInstance.start();

  try {
    await pgInstance.createDatabase('nmit_hack_league');
  } catch (e) {
    // Database already exists
  }

  console.log(`[POSTGRES] Native PostgreSQL ready on port ${port}`);
}

process.on('SIGINT', async () => {
  if (pgInstance) {
    console.log('[POSTGRES] Stopping local PostgreSQL engine...');
    await pgInstance.stop();
  }
  process.exit(0);
});

if (require.main === module) {
  ensurePostgresRunning().catch(console.error);
}
