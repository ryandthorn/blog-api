const express = require('express');
const router = express.Router();

const {Author, BlogPost} = require('./models');

router.get('/', (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json({
        posts: posts.map(
          (post) => post.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error"});
    });
});

router.get('/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => {
      res.json({
        title: post.title,
        author: post.authorFullName,
        content: post.content,
        comments: post.comments
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author_id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
        BlogPost
          .create({
            title: req.body.title,
            content: req.body.content,
            author: author
          })
          .then(post => res.status(201).json(post.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong'});
    });
});

// PUT still displays author as undefined undefined
router.put('/:id', (req, res) => {

  if (!(req.body.title)) {
      const message = `Missing title in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ["title", "content"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

// Solution doesn't return author info
  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(updatedPost => res.status(200).json({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content
    }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(post => {
      console.log(`Deleted blog post with ID ${req.params.id}`);
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

module.exports = router;