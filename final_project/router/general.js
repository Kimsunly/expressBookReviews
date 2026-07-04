const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username) || !isValid(password)) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const alreadyExists = users.find((user) => user.username === username);
  if (alreadyExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json({
    message: "Get All books Successfully.",
    data: books
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json({
    message: "Get book detail successfully",
    data: book
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = Object.values(books).filter(
    b => b.author.toLowerCase() === author
  );
  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this author!" });
  }
  return res.status(200).json({
    message: "Get books for this author successfully",
    data: result
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = Object.values(books).filter(
    b => b.title.toLowerCase() === title
  );
  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this title!" });
  }
  return res.status(200).json({
    message: "Get books for this title successfully",
    data: result
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
