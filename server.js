
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: { rejectUnauthorized: false }
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado ao MySQL com sucesso!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
  });

app.get('/', (req, res) => {
  res.send('API DebtManager Online');
});

app.get('/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro no GET /customers:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/customers', async (req, res) => {
  const { id, name, phone, email, totalDebt } = req.body;
  if (!name || !id) return res.status(400).json({ error: 'Nome e ID são obrigatórios' });

  try {
    await pool.query(
      'INSERT INTO customers (id, name, phone, email, totalDebt) VALUES (?, ?, ?, ?, ?)',
      [id, name, phone, email, totalDebt || 0]
    );
    res.status(201).json({ success: true, message: 'Cliente criado' });
  } catch (error) {
    console.error('Erro no POST /customers:', error);
    res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
  }
});

// Novo endpoint para edição
app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, totalDebt } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, totalDebt = ? WHERE id = ?',
      [name, phone, email, totalDebt, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ success: true, message: 'Cliente atualizado' });
  } catch (error) {
    console.error('Erro no PUT /customers:', error);
    res.status(500).json({ error: 'Erro ao atualizar no banco de dados' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
