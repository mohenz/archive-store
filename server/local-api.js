import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const uploadRoot = path.join(projectRoot, 'local', 'uploads');

await mkdir(uploadRoot, { recursive: true });

const pool = new pg.Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 54324),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || undefined,
  database: process.env.PGDATABASE || 'archive_store',
});

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadRoot),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^\w.\-가-힣 ]/g, '_');
    callback(null, `${crypto.randomUUID()}_${safeName}`);
  },
});

const upload = multer({ storage });
const app = express();

app.use(cors({ origin: ['http://127.0.0.1:5174', 'http://localhost:5174'] }));
app.use(express.json());
app.use('/files', express.static(uploadRoot));

function getCategory(file) {
  if (file.mimetype.startsWith('image/')) return 'image';
  if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') return 'text';

  const extension = path.extname(file.originalname).slice(1).toLowerCase();
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'document';
  return 'other';
}

function rowToFile(row) {
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    size: Number(row.size_bytes),
    category: row.category,
    storagePath: row.storage_path,
    downloadUrl: `http://127.0.0.1:${process.env.API_PORT || 5175}/files/${path.basename(row.storage_path)}`,
    tags: row.tags,
    uploadedAt: { seconds: Math.floor(new Date(row.created_at).getTime() / 1000) },
  };
}

app.get('/api/health', async (_req, res) => {
  const result = await pool.query('select now() as now');
  res.json({ ok: true, databaseTime: result.rows[0].now });
});

app.get('/api/files', async (_req, res) => {
  const result = await pool.query('select * from archive_files order by created_at desc');
  res.json(result.rows.map(rowToFile));
});

app.post('/api/files', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'file is required' });
    return;
  }

  const id = crypto.randomUUID();
  const storagePath = req.file.path;
  const category = getCategory(req.file);

  const result = await pool.query(
    `insert into archive_files
      (id, filename, mime_type, size_bytes, category, storage_path)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [id, req.file.originalname, req.file.mimetype || 'application/octet-stream', req.file.size, category, storagePath],
  );

  res.status(201).json(rowToFile(result.rows[0]));
});

const port = Number(process.env.API_PORT || 5175);
app.listen(port, '127.0.0.1', () => {
  console.log(`Archive Store local API: http://127.0.0.1:${port}`);
});

