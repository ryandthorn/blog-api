const express = require('express');
const router = express.Router();

const {Author, BlogPost} = require('./models');

router.get('/', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => author.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Author
    .findOne({ userName: req.body.userName})
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      } else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json(author.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: `Something went wrong`})
          })
      }
    })
});

router.put('/:id', (req, res) => {
  if (!(req.body.id)) {
    const message = `Missing author ID in request body`
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
  const updateableFields = ["firstName", "lastName", "userName"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  
  Author
    .findOne({ userName: req.body.userName})
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      } 
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
          .then(post => res.status(200).json(post.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.delete('/:id', (req, res) => {
  BlogPost
    .remove({author: req.params.id})
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(author => {
          console.log(`Deleted blog posts owned by ${author.userName} with ID ${req.params.id}`);
          res.status(204).end();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

module.exports = router;