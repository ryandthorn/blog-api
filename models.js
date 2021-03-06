"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

authorSchema.virtual("authorName").get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

authorSchema.methods.serialize = function() {
  return {
    _id: this._id,
    name: this.authorName,
    userName: this.userName
  };
};

const commentSchema = mongoose.Schema({ content: 'string' });

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
  content: String,
  created: {type: Date, default: Date.now},
  comments: [commentSchema]
});

blogPostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.pre('findByIdAndUpdate', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.virtual("authorName").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorName,
    content: this.content,
    created: this.created,
    comments: this.comments
  };
};

const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { Author, BlogPost };
/*
{
  create: function(title, content, author, publishDate) {
    const post = {
      id: uuid.v4(),
      title: title,
      content: content,
      author: author,
      publishDate: publishDate || Date.now()
    };
    this.posts.push(post);
    return post;
  },
  get: function(id=null) {
    // if id passed in, retrieve single post,
    // otherwise send all posts.
    if (id !== null) {
      return this.posts.find(post => post.id === id);
    }
    // return posts sorted (descending) by
    // publish date
    return this.posts.sort(function(a, b) {
      return b.publishDate - a.publishDate
    });
  },
  delete: function(id) {
    const postIndex = this.posts.findIndex(
      post => post.id === id);
    if (postIndex > -1) {
      this.posts.splice(postIndex, 1);
    }
  },
  update: function(updatedPost) {
    const {id} = updatedPost;
    const postIndex = this.posts.findIndex(
      post => post.id === updatedPost.id);
    if (postIndex === -1) {
      throw new StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.posts[postIndex] = Object.assign(
      this.posts[postIndex], updatedPost);
    return this.posts[postIndex];
  }
};
*/
