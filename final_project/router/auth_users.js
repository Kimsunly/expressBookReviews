const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// check if username is valid
const isValid = (username) => {
  if (!username || username.trim() === "") {
    return false;
  }
  return true;
};

// check if username and password match
const authenticatedUser = (username, password) => {
  const exists = users.find(
    user => user.username === username && user.password === password
  );

  if (!exists) {
    return false;
  }
  return true;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  let user = req.body;

  if (!isValid(user.username) || !isValid(user.password)) {
    return res.status(400).json({ message: "Invalid username or password !" });
  }

  if (!authenticatedUser(user.username, user.password)) {
    return res.status(400).json({ message: "User Not exist!" });
  }

  // generate JWT token
  const token = jwt.sign(
    { username: user.username },
    "secretKey",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    token,
    username: user.username
  };

  return res.status(200).json({
    message: "Login Successfully",
    token
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user && req.user.username;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found!" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // add or update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;