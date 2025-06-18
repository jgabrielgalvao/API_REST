const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Conexão com MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    process.exit(1);
  }
  console.log('Conectado ao MySQL!');
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// GET - Todos os empréstimos
app.get('/emprestimos', (req, res) => {
  db.query('SELECT * FROM emprestimos', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar empréstimos' });
    res.json(results);
  });
});

// POST - Adicionar novo empréstimo
app.post('/emprestimos', (req, res) => {
  const { nomeLivro, autor, dataEmprestimo, nomeLeitor } = req.body;
  if (!nomeLivro || !autor || !dataEmprestimo || !nomeLeitor) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  db.query(
    'INSERT INTO emprestimos (nome_livro, autor, data_emprestimo, nome_leitor) VALUES (?, ?, ?, ?)',
    [nomeLivro, autor, dataEmprestimo, nomeLeitor],
    (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao adicionar empréstimo' });
      res.status(201).json({ id: result.insertId, nomeLivro, autor, dataEmprestimo, nomeLeitor });
    }
  );
});

// DELETE - Deletar um empréstimo pelo ID
app.delete('/emprestimos/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM emprestimos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar empréstimo' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }

    res.status(200).json({ mensagem: 'Empréstimo deletado com sucesso' });
  });
});

// PUT - Atualizar um empréstimo pelo ID
app.put('/emprestimos/:id', (req, res) => {
  const id = req.params.id;
  console.log('Recebido PUT para id:', req.params.id); 
  console.log('id: ', id);
  const { nomeLivro, autor, dataEmprestimo, nomeLeitor } = req.body;

  if (!nomeLivro || !autor || !dataEmprestimo || !nomeLeitor) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  db.query(
    'UPDATE emprestimos SET nome_livro = ?, autor = ?, data_emprestimo = ?, nome_leitor = ? WHERE id = ?',
    [nomeLivro, autor, dataEmprestimo, nomeLeitor, id],
    (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao atualizar empréstimo' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: 'Empréstimo não encontrado' });
      }

      res.status(200).json({ mensagem: 'Empréstimo atualizado com sucesso' });
    }
  );
});


// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`API rodando na porta ${port}`);
});
