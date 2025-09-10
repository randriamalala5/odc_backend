const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie la présence du token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretdev');
    req.user = decoded; // Injecte les infos du token dans la requête
    next();
  } catch (err) {
    return res.status(403).json({ error: `Token invalide ou expiré. ${authHeader}` });

  }
};
