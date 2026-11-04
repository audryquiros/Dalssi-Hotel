import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';
dotenv.config();
const port = Number(process.env.PORT || 3000);
try {
  await testConnection();
  console.log('Conexión con MySQL establecida.');
  app.listen(port, () => console.log(`Dalssi API disponible en http://localhost:${port}`));
} catch (error) {
  console.error('No se pudo conectar con MySQL. Verifique el servicio y las variables del archivo .env.');
  console.error(error.message);
  process.exit(1);
}
