const express = require('express');
const router = express.Router();
const supabase = require('../config/supaBase');

router.get('/test-supabase', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

module.exports = router;
