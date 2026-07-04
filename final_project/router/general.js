const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Local endpoint used by the Axios-based Task 11 routes.
const booksApiUrl = 'http://localhost:5000/books';

// Shared Axios helper so every lookup route uses the same data source.
const fetchBooks = async () => {
  const response = await axios.get(booksApiUrl);
  return response.data;
};

// Small normalization helper so author/title matching stays consistent.
const normalizeValue = (value) => value.toLowerCase();

// Reusable filter helper for the author/title search routes.
const findBooksByField = (catalog, field, value) => {
  return Object.values(catalog).filter(
    (book) => normalizeValue(book[field]) === normalizeValue(value)
  );
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

// Internal catalog endpoint consumed by the Axios-powered routes below.
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop.
// The response keeps a consistent { message, data } structure.
public_users.get('/', async function (req, res) {
  try {
    const data = await fetchBooks();
    return res.status(200).json({
      message: "Get All books Successfully.",
      data
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

// Get book details based on ISBN.
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

// Get book details based on author.
// The same async helper is reused so the Axios flow stays consistent.
public_users.get('/author/:author', async function (req, res) {
  try {
    const data = await fetchBooks();
    const result = findBooksByField(data, 'author', req.params.author);

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

// Get book details based on title.
public_users.get('/title/:title', async function (req, res) {
  try {
    const data = await fetchBooks();
    const result = findBooksByField(data, 'title', req.params.title);

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

// Get book review details by ISBN.
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const data = await fetchBooks();
    const book = data[isbn];

    if (book) {
      return res.status(200).json({
        message: "Get book reviews successfully",
        data: book.reviews
      });
    }

    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve book reviews" });
  }
});

module.exports.general = public_users;