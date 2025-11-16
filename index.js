const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');



// Middleware
app.use(bodyParser.json());

const PORT = process.env.PORT // Provide a default port

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server started successfully on PORT: ${PORT}`);
});
