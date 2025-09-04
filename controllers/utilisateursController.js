const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// exports.getAllDbUsers = (req, res) => {
//     res.json([
//       { id: 1, name: 'Andre' },
//       { id: 2, name: 'Felix' }
//     ]);
//   };

// CREATE USER
exports.createUserNotHashed = (req, res) => {
    const { pseudo, email, pass } = req.body;
  
    if (!name || !email || !pass) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }
  
    const query = 'INSERT INTO utilisateurs (utl_pseudo, utl_email, utl_pass) VALUES (?, ?, ?)';
    db.query(query, [pseudo, email, pass], (err, result) => {
      if (err) {
        console.error('Erreur SQL :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'insertion' });
      }
  
      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        userId: result.insertId
      });
    });
  };

// CREATE AN USER
  exports.createUser = async (req, res) => {
    const { pseudo, email, pass } = req.body;
  
    // Validation basique
    if (!pseudo) {
      return res.status(400).json({ error: 'Username manquants.' });
    } else if (!email){
        return res.status(400).json({ error: 'E-mail manquants.' });
    } else if (!pass){
        return res.status(400).json({ error: 'Mot de passe manquants.' });
    }
  
    try {
      // Vérifier si l’email existe déjà
      const [existing] = await db.promise().query('SELECT utl_id FROM utilisateurs WHERE utl_email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      }
  
      // Hasher le mot de passe
      const hashedPass = await bcrypt.hash(pass, 10); // 10 = nombre de "salt rounds"
  
      // Insérer l’utilisateur
      const query = 'INSERT INTO utilisateurs (utl_pseudo, utl_email, utl_pass) VALUES (?, ?, ?)';
      const [result] = await db.promise().query(query, [
        pseudo,
        email,
        hashedPass
      ]);
  
      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        userId: result.insertId
      });
  
    } catch (err) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };

// READ ALL USERS
exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM utilisateurs', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur SQL' });
    }
    res.json(results);
  });
};

// READ AN USER by HIS ID
exports.getUser = async (req, res) => {
  const {id} = req.params;
  try{
    const [rows] = await db.promise().query('SELECT * FROM utilisateurs WHERE utl_id=?', [id]);
    if (rows.length == 0){
      return res.status(404).json({error: 'Utilisateur non trouve'});
    }
    res.status(200).json(rows[0]);
  } catch (err){
    res.status(500).json({error: 'Erreur du serveur'})
  };
};

// exports.getUserById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [rows] = await db.promise().query('SELECT * FROM users WHERE usr_id = ?', [id]);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Utilisateur non trouvé.' });
//     }
//     res.status(200).json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// UPDATE AN USER by HIS ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  let { pseudo, email, pass } = req.body;

  try {
    // Vérifier existence
    const [existing] = await db.promise().query('SELECT * FROM utilisateurs WHERE utl_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // Si on met à jour l'email, s'assurer qu'il est unique
    if (email && email !== existing[0].usr_mail) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Format d’email invalide.' });
      }
      const [dup] = await db.promise().query(
        'SELECT utl_id FROM utilisateurs WHERE utl_email = ? AND utl_id != ?',
        [email, id]
      );
      if (dup.length > 0) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      }
    }

    // Hasher le mot de passe si présent
    if (pass) {
      pass = await bcrypt.hash(pass, 10);
    } else {
      pass = existing[0].utl_pass;
    }

    // Construire la requête d'update
    const query = `
      UPDATE utilisateurs
      SET utl_pseudo      = ?,
          utl_email      = ?,
          utl_pass      = ?
      WHERE utl_id = ?
    `;

    await db
      .promise()
      .query(query, [
        pseudo || existing[0].utl_pseudo,
        email || existing[0].utl_email,
        pass,
        id
      ]);

    res.status(200).json({ message: `Utilisateur numero ${id} bien modifié avec succès.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE AN USER
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query('DELETE FROM utilisateurs WHERE utl_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.status(200).json({ message: `Utilisateur ${id} supprimé avec succès.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// LOGIN
// exports.loginUser = async (req, res) => {
//   const { email, pass } = req.body;

//   if (!email || !pass) {
//     return res.status(400).json({ error: 'Email et mot de passe requis.' });
//   }

//   try {
//     // Vérifier si l’utilisateur existe
//     const [users] = await db.promise().query('SELECT * FROM utilisateurs WHERE utl_email = ?', [email]);

//     if (users.length === 0) {
//       return res.status(401).json({ error: 'Email non trouve. Veuillez verifiez votre e-mail' });
//     }

//     const user = users[0];

//     // Comparer le mot de passe
//     const isMatch = await bcrypt.compare(pass, user.utl_pass);
//     if (!isMatch) { 
//       // return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
//       return res.status(401).json({ error: user.utl_pass });
//     }

//     // Générer le token JWT
//     const token = jwt.sign(
//       { utl_id: user.utl_id, utl_email: user.utl_email },
//       process.env.JWT_SECRET || 'secretdev', // à stocker dans .env
//       { expiresIn: '24h' }
//     );

//     res.status(200).json({
//       message: 'CONNEXION REUSSI ✔',
//       email: email,
//       token
//     });

//   } catch (err) {
//     console.error('Erreur login :', err.message);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// LOGIN
exports.loginUsers = async (req, res) => {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    // Vérifier si l’utilisateur existe
    const [users] = await db.promise().query('SELECT * FROM utilisateurs WHERE utl_email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email non trouve. Veuillez verifiez votre e-mail' });
    }

    const user = users[0];

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(pass, user.utl_pass);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { utl_id: user.utl_id, utl_mail: user.utl_email },
      process.env.JWT_SECRET || 'secretdev', // à stocker dans .env+
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'CONNEXION REUSSI ✔',
      email: email,
      token
    });

  } catch (err) {
    console.error('Erreur login :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// LOGIN
// exports.loginUserss = async (req, res) => {
//   const { email, pass } = req.body;

//   if (!email || !pass) {
//     return res.status(400).json({ error: 'Email et mot de passe requis.' });
//   }

//   try {
//     // Vérifier si l’utilisateur existe
//     const [users] = await db.promise().query('SELECT * FROM users WHERE usr_mail = ?', [email]);

//     if (users.length === 0) {
//       return res.status(401).json({ error: 'Email non trouve. Veuillez verifiez votre e-mail' });
//     }

//     const user = users[0];

//     // Comparer le mot de passe
//     const isMatch = await bcrypt.compare(pass, user.usr_pass);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
//     }

//     // Générer le token JWT
//     const token = jwt.sign(
//       { usr_id: user.usr_id, usr_mail: user.usr_mail },
//       process.env.JWT_SECRET || 'secretdev', // à stocker dans .env
//       { expiresIn: '24h' }
//     );

//     res.status(200).json({
//       message: 'CONNEXION REUSSI ✔',
//       email: email,
//       token
//     });

//   } catch (err) {
//     console.error('Erreur login :', err.message);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };