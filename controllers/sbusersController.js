const supabase = require('../config/supaBase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { use } = require('../routes/utilisateurs');

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
      const {data: existing, error} = await supabase.from('utilisateurs').select('utl_id').eq('utl_email', email).single();
      // const [existing] = dex;

      if (existing) {
        console.log('EXISTING DATA: ID: '+ existing.utl_id +';\nPSEUDO: '+existing.utl_pseudo+';\nE-mail: '+existing.utl_email);
        return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      } else {
          // Hasher le mot de passe
        const hashedPass = await bcrypt.hash(pass, 10); // 10 = nombre de "salt rounds"
      
        const {data: result, error: insertError} = await supabase.from('utilisateurs').insert([
            { utl_pseudo: pseudo, utl_email: email, utl_pass: hashedPass }
            ]).select();
          if (insertError) {
            console.log("ERROR (insertion): " + insertError.message + "; Existing: "+existing);
            // return res.status(500).json({ error: 'Erreur lors de l\'insertion.' });
          }else{
          // const result = data[0];
          res.status(201).json({
          message: 'Utilisateur créé avec succès',
          userId: result.insertId
        });}
      }

      // if (error){
      //   console.log('ERROR (verification d\'existing): '+error);
      // }
      
    } catch (err) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };

// READ ALL USERS
exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from('utilisateurs').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// READ AN USER by HIS ID
exports.getUser = async (req, res) => {
  const {id} = req.params;
  try{
    const [rows] =await supabase.from('utilisateurs').select('*').eq('id', id).single();
    if (rows.length == 0){
      return res.status(404).json({error: 'On ne trouve pas cet Utilisateur (READ ONE)'});
    }
    res.status(200).json(rows[0]);
  } catch (err){
    res.status(500).json({error: 'Erreur du serveur'})
  };
};

// GET USER PROFILE
exports.getProfile = async (req, res) => {
  const userId = req.user.utl_id; // Injecté par le middleware JWT

  try {
    const {data: rows, error} = await supabase.from('utilisateurs').select('*').eq('utl_id', userId).single();

    if (!rows) {
      return res.status(404).json({ error: 'Utilisateur non trouvé (GET PROFILE)' });
    } else {
      console.log('ROWS: '+rows);
      res.status(200).json({
        message: 'Profil utilisateur récupéré ✔',
        profil: rows
      });
    }

  } catch (err) {
    console.error('Erreur profil :', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// UPDATE AN USER by HIS ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, number } = req.body;
  const { data, error } = await supabase.from('utilisateurs').update({
    nom, prenom, email, number
  }).eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  let { pseudo, email, pass } = req.body;

  try {
    // Vérifier existence
    const [existing] = await supabase.from('utilisateurs').select('utl_email').eq('utl_id', id).single();
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé (UPDATE).' });
    }

    // Si on met à jour l'email, s'assurer qu'il est unique
    if (email && email !== existing[0].usr_mail) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Format d’email invalide.' });
      }
      const [dup] = await supabase.from('utilisateurs').select('utl_id')
						.eq('usr_email', email)
						.eq('utl_id',id);
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
	
	const dbupdate = {
        pseudo : pseudo || existing[0].utl_pseudo,
        email : email || existing[0].utl_email,
        pass
		};
	  
	await supabase.from('utilisateurs').update(dbupdate).eq('utl_id',id);

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
    const result = await supabase.from('utilisateurs').delete().eq('utl_id',id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé (DELETE)' });
    }
    res.status(200).json({ message: `Utilisateur ${id} supprimé avec succès.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// LOGIN
exports.loginUsers = async (req, res) => {
  const { email, pass } = req.body || {};

  if (!email || !pass) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    // Vérifier si l’utilisateur existe
    const {data: user, error: checkError} = await supabase.from('utilisateurs').select('*').eq('utl_email', email).single();
    if (!user) {
      return res.status(401).json({ error: 'Email non trouve. Veuillez verifiez votre e-mail' });
    } else {
      // const user = users[0];
    
      console.log('##########\nLOGIN WITH\nID :'+user.utl_id+';\nPSEUDO: '+user.utl_pseudo+';\nE-mail: '+user.utl_email+'\n##########');

      // Comparer le mot de passe
      const isMatch = await bcrypt.compare(pass, user.utl_pass);
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { utl_id: user.utl_id, utl_mail: user.utl_email },
        process.env.JWT_SECRET || 'secretdev', // à stocker dans .env+
        { expiresIn: '1min' }
      );

      res.status(200).json({
        message: 'CONNEXION REUSSI ✔',
        id: user.utl_id,
        pseudo: user.utl_pseudo,
        email: email,
        token
      });
    }

  } catch (err) {
    console.error('Erreur login :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};