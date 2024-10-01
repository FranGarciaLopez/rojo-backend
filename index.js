
const express = require('express');

const app = express();
app.use(express.json());

const usersRouter = require('./routes/usersRouter');

app.use('/users', usersRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = { app };