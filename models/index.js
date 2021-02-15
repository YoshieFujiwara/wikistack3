const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/wikistack3', {
  logging: false,
});

//Test DB connection
db.authenticate().then(() => {
  console.log('connected to the database');
});

const Page = db.define('page', {
  title: { type: Sequelize.STRING, allowNull: false },
  slug: { type: Sequelize.STRING, allowNull: false, unque: true },
  content: { type: Sequelize.TEXT, allowNull: false },
  status: {
    type: Sequelize.ENUM,
    values: ['open', 'closed'],
    defaultValue: 'open',
  },
});

//hook - need to develop still
// this hook applied at instance level when creating a new instance.

function generateSlug(title) {
  return title.replace(/\s+/g, '_').replace(/\W/g, '');
}

Page.beforeValidate(async (page, options) => {
  const newSlug = await generateSlug(page.title);
  page.slug = newSlug;
});

Page.afterUpdate(async (page, options) => {
  const newSlug = await generateSlug(page.title);
  page.slug = newSlug;
});

const User = db.define('user', {
  name: { type: Sequelize.STRING, allowNull: false },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unqie: true,
  },
});

Page.belongsTo(User, { as: 'author' });

module.exports = { db, Page, User };
