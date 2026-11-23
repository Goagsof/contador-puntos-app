import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { createRequire } from 'module';

dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba: verificar que el backend habla con Firestore
app.get('/api/health', async (req, res) => {
  try {
    // Hacemos una consulta trivial a Firestore
    await db.collection('_test').limit(1).get();
    res.json({ status: 'ok', message: 'API + Firestore funcionando' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'No se pudo conectar a Firestore' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});