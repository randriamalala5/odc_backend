require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const port = process.env.PORT;
const router = express.Router();

const dotenv = require('dotenv');
const userRoutes = require('./routes/utilisateurs');
const participantRoutes = require('./routes/participants');
const { loginUserss } = require('./controllers/utilisateursController');

dotenv.config();
const app = express();
app.use(express.json());

const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
  };

// Routes
app.use('/api/users', userRoutes);
app.use('/api/prt', participantRoutes);
app.post('/login', loginUserss);
// app.use('/api/users/dbu', userRoutes);
// router.post('/', createUser);

app.get('/hello', (req, res) => {
    res.send('Hello bro');
});

// app.listen(3000, () => {
//     console.log('Server is running in https://localhost:3000');
// });

https.createServer(options, app).listen(port, () => {
    console.log('HTTPS server running on https://localhost:3000');
  });


