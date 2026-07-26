import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Ejecutar migraciones en la base de datos de pruebas
const command = 'npx prisma migrate deploy';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});