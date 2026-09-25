// Adds a few sample books so the catalog isn't empty during a demo.
// Run with: npm run seed   (books that already exist by ISBN are skipped)
require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../models/Book");

const books = [
  { title: "Clean Code", author: "Robert C. Martin", category: "Programming", isbn: "9780132350884", quantity: 4, description: "A handbook of agile software craftsmanship with practical advice on writing readable, maintainable code.", publicationInfo: { publisher: "Prentice Hall", publicationDate: "2008-08-01", edition: "1st" } },
  { title: "Head First Java", author: "Kathy Sierra, Bert Bates", category: "Programming", isbn: "9781491910771", quantity: 3, description: "A visually rich introduction to Java and object-oriented programming.", publicationInfo: { publisher: "O'Reilly Media", publicationDate: "2022-05-01", edition: "3rd" } },
  { title: "Database System Concepts", author: "Abraham Silberschatz", category: "Computer Science", isbn: "9780078022159", quantity: 2, description: "Covers database design, SQL, storage, indexing, transactions and recovery.", publicationInfo: { publisher: "McGraw-Hill", publicationDate: "2019-02-01", edition: "7th" } },
  { title: "Operating System Concepts", author: "Abraham Silberschatz", category: "Computer Science", isbn: "9781119800361", quantity: 2, description: "The standard text on processes, memory management, file systems and security.", publicationInfo: { publisher: "Wiley", publicationDate: "2021-01-01", edition: "10th" } },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Computer Science", isbn: "9780262046305", quantity: 3, description: "A comprehensive guide to the design and analysis of algorithms.", publicationInfo: { publisher: "MIT Press", publicationDate: "2022-04-05", edition: "4th" } },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction", isbn: "9780141439518", quantity: 5, description: "Elizabeth Bennet and Mr Darcy in Austen's classic novel of manners.", publicationInfo: { publisher: "Penguin Classics", publicationDate: "2002-12-31", edition: "Reissue" } },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "9780061120084", quantity: 3, description: "A story of racial injustice and childhood in the American South.", publicationInfo: { publisher: "Harper Perennial", publicationDate: "2006-05-23" } },
  { title: "The Guide", author: "R. K. Narayan", category: "Fiction", isbn: "9780143039648", quantity: 2, description: "Raju, a tour guide in Malgudi, is mistaken for a holy man.", publicationInfo: { publisher: "Penguin", publicationDate: "2006-08-01" } },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "9780062316097", quantity: 3, description: "A brief history of humankind from the Stone Age to the present.", publicationInfo: { publisher: "Harper", publicationDate: "2015-02-10" } },
  { title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History", isbn: "9780143031031", quantity: 2, description: "Nehru's account of Indian history, philosophy and culture, written in prison.", publicationInfo: { publisher: "Penguin", publicationDate: "2004-01-01" } },
  { title: "Atomic Habits", author: "James Clear", category: "Self Help", isbn: "9780735211292", quantity: 4, description: "Practical strategies for building good habits and breaking bad ones.", publicationInfo: { publisher: "Avery", publicationDate: "2018-10-16" } },
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", isbn: "9780553380163", quantity: 2, description: "From the Big Bang to black holes, explained for the general reader.", publicationInfo: { publisher: "Bantam", publicationDate: "1998-09-01", edition: "10th anniversary" } },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let added = 0;
  for (const book of books) {
    const exists = await Book.findOne({ isbn: book.isbn });
    if (!exists) {
      await Book.create({ ...book, availableQuantity: book.quantity });
      added += 1;
    }
  }
  console.log(`Seed finished: ${added} book(s) added, ${books.length - added} already present.`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
