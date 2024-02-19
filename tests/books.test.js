process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const app = require("../app");

beforeAll(() => {
  console.log("NODE_ENV:", process.env.NODE_ENV);
});

// isbn of sample book
let book_isbn;

beforeEach(async () => {
  let result = await db.query(
    `
    INSERT INTO 
    books (isbn, amazon_url,author,language,pages,publisher,title,year)
    VALUES(
      '123456789',
      'https://amazon.com/alchemist',
      'Paulo',
      'Coelho',
      333,
      'Nothing publishers',
      'my first book', 2008)
    RETURNING isbn`
  );

  book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
  test("Gets a list of books", async function () {
    const response = await request(app).get("/books");
    expect(response.body.books).toBeDefined();

    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0].isbn).toEqual("123456789");
  });
});

describe("POST /books", function () {
  test("Adds a new Book", async function () {
    const response = await request(app).post("/books").send({
      isbn: "192837465",
      amazon_url: "https://newBook.com",
      author: "newbie",
      language: "newReading",
      pages: 1000,
      publisher: "Its New",
      title: "NEW BOOK",
      year: 2022,
    });
    expect(response.body.book).toBeDefined();
    expect(response.body.book.author).toBe("newbie");
  });
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "32794782",
      amazon_url: "https://taco.com",
      author: "mctest",
      language: "english",
      pages: 1000,
      publisher: "yeah right",
      title: "amazing times",
      year: 2000,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });
});

describe("GET /books/:id", function () {
  test("Get book by valid id", async function () {
    const response = await request(app).get(`/books/${book_isbn}`);
    expect(response.body.book).toBeDefined();

    const book = response.body.book;
    expect(book.author).toBe("Paulo");
    expect(response.statusCode).toBe(200);
  });

  test("GET book by Invalid isbn", async function () {
    const response = await request(app).get("/books/99999");
    expect(response.body.book).toBeUndefined();
    expect(response.statusCode).toBe(404);
  });
});

describe("PUT /books/:id", function () {
  test("Update book by id with given values", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      amazon_url: "https://taco.com",
      author: "mctest",
      language: "english",
      pages: 1000,
      publisher: "yeah right",
      title: "UPDATED BOOK",
      year: 2000,
    });
    console.log("RESPONSE:", response.body);
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });
});

describe("DELETE /books/:id", function () {
  test("Deletes a single book by id", async function () {
    const response = await request(app).delete(`/books/${book_isbn}`);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Book deleted");
  });
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end();
});
