# PrepPal Backend (Quizzes & Flashcards API)

A small Express + MySQL REST API that powers the Quizzes and Flashcards pages.

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials
```

## 2. Create the database

```bash
mysql -u root -p < schema.sql
```

This creates the `preppal` database, all tables, and seeds two users
(Alex Chen / id 1, Sam Lee / id 2) plus sample quizzes and flashcard decks.

## 3. Run the server

```bash
npm start
```

The API runs on `http://localhost:4000` by default.

## Authentication

PrepPal uses JSON Web Token (JWT) for authentication. If 'preppal' database already exists after the setup, there will be 7 users available, 2 students, 4 tutors and 1 admin which are:

```bash
Student Role 1
Email Address: alex@school.edu
Password: password123

Student Role 2
Email Address: sam@school.edu
Password: password123

Tutor Role
Email Address: sarah@school.edu
Password: password123

Tutor Role 2
Email Address: james@school.edu
Password: password123

Tutor Role 3
Email Address: emily@school.edu
Password: password123

Tutor Role 4
Email Address: david@school.edu
Password: password123

Admin Role
Email Address: admin@school.edu
Password: password123
```

## API Reference

### Quizzes

| Method | Endpoint                      | Description |
|--------|-------------------------------|-------------|
| GET    | `/api/quizzes`                | List quizzes. Query params: `subject`, `topic`, `search`, `mine=true` |
| GET    | `/api/quizzes/meta/filters`   | Distinct subjects/topics for filter dropdowns |
| GET    | `/api/quizzes/:id`             | Get one quiz with its questions |
| POST   | `/api/quizzes`                 | Create a quiz |
| PUT    | `/api/quizzes/:id`              | Update a quiz (owner only) |
| DELETE | `/api/quizzes/:id`              | Delete a quiz (owner only) |
| POST   | `/api/quizzes/:id/attempts`     | Submit answers, get score + review |

**Create/update body:**
```json
{
  "title": "Biology — Cell Structure",
  "subject": "Biology",
  "topic": "Cells",
  "difficulty": "Medium",
  "visibility": "public",
  "questions": [
    { "text": "What is the powerhouse of the cell?", "choices": ["Nucleus","Mitochondria","Ribosome","Golgi body"], "correct": 1 }
  ]
}
```

**Submit attempt body:**
```json
{ "answers": { "0": 1, "1": 2 } }
```
Returns `{ score, total, results: [{ index, text, choices, correct, chosen, isCorrect }] }`.

### Flashcard Decks

| Method | Endpoint                    | Description |
|--------|-----------------------------|-------------|
| GET    | `/api/decks`                | List decks. Query params: `subject`, `topic`, `search`, `mine=true` |
| GET    | `/api/decks/meta/filters`   | Distinct subjects/topics for filter dropdowns |
| GET    | `/api/decks/:id`             | Get one deck with its cards |
| POST   | `/api/decks`                 | Create a deck |
| PUT    | `/api/decks/:id`              | Update a deck (owner only) |
| DELETE | `/api/decks/:id`              | Delete a deck (owner only) |
| POST   | `/api/decks/:id/attempts`     | Submit study session results |

**Create/update body:**
```json
{
  "title": "Biology Vocabulary",
  "subject": "Biology",
  "topic": "Cells",
  "visibility": "public",
  "cards": [
    { "q": "What is mitosis?", "a": "Cell division producing two identical daughter cells" }
  ]
}
```

**Submit attempt body:**
```json
{ "results": { "1": "correct", "2": "wrong" } }
```
Keys are flashcard `id`s, values are `"correct"` or `"wrong"`.
Returns `{ correct, total, wrongCards: [2] }`.

### Users

| Method | Endpoint        | Description |
|--------|-----------------|-------------|
| GET    | `/api/users/me` | Current user (based on `x-user-id` header) |
| GET    | `/api/users`    | List all users |
