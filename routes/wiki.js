const express = require('express');
const router = express.Router();

//DB
const { Page, User } = require('../models');

//views
const { addPage, main, wikipage, wikiPage, editPage } = require('../views');

router.get('/', async (req, res, next) => {
  try {
    const allPosts = await Page.findAll();
    res.send(main(allPosts));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    let user = await User.findOrCreate({
      where: { email: req.body.email, name: req.body.author },
    });

    console.log('user', user);

    let newPost = await Page.create({
      title: req.body.title,
      content: req.body.content,
      status: req.body.status,
    });

    await newPost.setAuthor(user[0]);

    res.redirect(`/wiki/${newPost.slug}`);
  } catch (err) {
    next(err);
  }
});

router.get('/add', (req, res, next) => {
  res.send(addPage());
});

router.get('/:slug', async (req, res, next) => {
  try {
    //since there is only 1 unique slug, findOne is used
    const slugPage = await Page.findOne({ where: { slug: req.params.slug } });

    if (!slugPage) {
      res.status(404).send('404 - Page Not Found 😭');
    } else {
      const user = await User.findAll({ where: { id: slugPage.authorId } });

      res.send(wikiPage(slugPage, user[0]));
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:slug', async (req, res, next) => {
  try {
    console.log(req.body);

    function generateSlug(title) {
      return title.replace(/\s+/g, '_').replace(/\W/g, '');
    }

    const updatedPage = await Page.update(
      {
        title: req.body.title,
        content: req.body.content,
        status: req.body.status,
        slug: generateSlug(req.body.title),
      },
      { where: { slug: req.params.slug }, returning: true, plain: true }
    );

    res.redirect(`/wiki/${updatedPage[1].slug}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/edit', async (req, res, next) => {
  try {
    let page = await Page.findOne({ where: { slug: req.params.slug } });

    let author = await User.findByPk(page.authorId);

    res.send(editPage(page, author));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/delete', async (req, res, next) => {
  try {
    await Page.destroy({ where: { slug: req.params.slug } });
    res.redirect(`/wiki`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
