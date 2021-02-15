const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const morgan = require('morgan');

//db
const { db } = require('./models');

//middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

//router
app.use('/wiki', require('./routes/wiki'));
app.use('/user', require('./routes/user'));

//views
const { notFound404, serverError500 } = require('./views');

//root directory
app.get('/', (req, res) => {
  res.redirect('/wiki');
});

//error handling
app.use((req, res, next) => {
  res.status(404).send(notFound404());
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(serverError500());
});

//webserver & DB connection
const PORT = 3000;

const init = async () => {
  await db.sync({ force: false });
  app.listen(PORT, () => {
    console.log(` Server is listening on PORT ${PORT} 📡`);
  });
};

init();
