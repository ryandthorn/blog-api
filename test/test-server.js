const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const { DATABASE_URL, PORT } = require('../config');
const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('Blog posts', function() {
  before(function() {
    return runServer(DATABASE_URL);
  });
  after(function() {
    return closeServer(DATABASE_URL);
  });

  it('should list blog post objects on GET', function() {
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate']
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });
  it('should create an item on POST', function() {
    const newItem = {title: 'test blog', content: 'content', author: 'Authorine Author', publishDate: '01/23/4567'};
    return chai.request(app)
      .post('/posts')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content', 'author'/*, 'publishDate'*/);
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });
  it('should update an item on PUT', function() {
    const updateItem = {title: 'test blog post', content: `here's the content`, author: 'Author Authorson', publishDate: '01/23/45'};
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        updateItem.id = res.body[0].id;
        return chai.request(app)
          .put(`/posts/${updateItem.id}`)
          .send(updateItem)
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      })
  });
  it('should delete an item on DELETE', function() {
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});