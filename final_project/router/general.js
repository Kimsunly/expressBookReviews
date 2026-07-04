const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const booksApiUrl = 'http://127.0.0.1:5000/books';

const fetchBooks = async () => {
  const response = await axios.get(booksApiUrl);
  return response.data;
};


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

public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const data = await fetchBooks();
    return res.status(200).json({
      message: "Get All books Successfully.",
      data: JSON.stringify(data, null, 3)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const data = await fetchBooks();
    const book = data[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({
      message: "Get book detail successfully",
      data: book
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve book detail" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    const data = await fetchBooks();
    const result = Object.values(data).filter(
      b => b.author.toLowerCase() === author
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "No books found for this author!" });
    }
    return res.status(200).json({
      message: "Get books for this author successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const data = await fetchBooks();
    const result = Object.values(data).filter(
      b => b.title.toLowerCase() === title
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "No books found for this title!" });
    }
    return res.status(200).json({
      message: "Get books for this title successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const data = await fetchBooks();
    const book = data[isbn];
    if (book) {
      return res.status(200).json(book.reviews);
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve book reviews" });
  }
});

module.exports.general = public_users;
