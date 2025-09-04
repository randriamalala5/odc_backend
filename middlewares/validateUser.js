const validator = require('validator');

module.exports = (req, res, next) => {
  const { pseudo, email } = req.body;

  // Vérification des champs obligatoires
  // if (!name || !email) {
  //   return res.status(400).json({ error: 'Nom et email sont requis.' });
  // }

  // if (!name) {
  //   return res.status(400).json({ error: 'Username manquants.' });
  // } else if (!email){
  //     return res.status(400).json({ error: 'E-mail manquants.' });
  // } else if (!pass){
  //     return res.status(400).json({ error: 'Mot de passe manquants.' });
  // }

  // Longueur minimale du nom
  if (pseudo.length < 6) {
    return res.status(400).json({ error: 'Le nom doit contenir au moins 5 caractères.' });
  }

  // Format de l’email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide.' });
  }

  next(); // Passe au contrôleur si tout est valide
};
