# 🚀 Trip Packer - Luggage Management System

---

## 🎯 Why I Built This Project

I have a confession: I *always* forget something when packing for a trip — whether it's a quick weekend getaway or a month-long vacation. Essential items somehow slip through the cracks every time.

While a simple checklist or notes app could help, I wanted a **structured, interactive solution** tailored to my needs.

**Trip Packer** was born from two main goals:

1. **Skill Application:** To apply concepts from the [FastAPI do Zero](https://fastapidozero.dunossauro.com/estavel/) course in a real-world project.
2. **Reusable Template:** To build a well-structured full-stack app combining a FastAPI backend with a React frontend — a solid foundation for future projects.

---

## 🗺️ Project Overview

Trip Packer is a **full-stack web application** designed to help you plan and organize your packing efficiently. It provides a clear overview of:

- What’s packed
- What’s still unpacked
- What needs to be purchased

Say goodbye to last-minute packing stress!

---

## 📦 Core Entities

The system is built around three main resources:

| Entity   | Description                          | Key Fields                                  |
| -------- | ---------------------------------- | -------------------------------------------|
| **Trip** | Represents a user’s journey        | `id`, `name`, `start_date`, `end_date`    |
| **Luggage (Bag)** | Represents a piece of luggage within a trip | `id`, `name`, `trip_id`                     |
| **Item** | Represents an article to be packed | `id`, `name`, `quantity`, `status`, `luggage_id` |

---

## ⚙️ Functional Features

### Trip Management
- Create, view, update, and delete trips.
- View detailed trip info including duration and day names.

### Luggage Management
- Add, view, update, and delete luggage within trips.
- Properly handle items when luggage is deleted.

### Item Management & Packing Workflow
- Add items to luggage with specified quantity.
- Update item details and status (`UNPACKED`, `PACKED`, `TO_BUY`).
- Move items between luggage within the same trip.
- Delete items.

### Pre-Trip Review
- Retrieve a structured overview of packing status per trip.
- Filter items by status to quickly identify unpacked or to-buy items.

---

## 🖥️ Frontend Technology Stack

- **Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **Component Development & Documentation:** Storybook
- **Code Quality:** ESLint, Prettier
- **Git Hooks:** Husky for pre-commit checks

### Frontend Highlights
- Consumes FastAPI backend via RESTful JSON APIs.
- Intuitive UI for managing trips, luggage, and items.
- Mobile-friendly and accessible design.
- Components developed and documented in Storybook.
- Automated tests with Vitest.
- Enforced code style and quality with ESLint, Prettier, and Husky.

---

## 🛠️ Backend Technology Stack

- **Framework:** FastAPI (Python)
- **Database:** Relational DB (SQLite by default) managed with SQLAlchemy and Alembic
- **API Design:** RESTful JSON APIs
- **Testing:** Pytest with Testcontainers for isolated testing
- **Linting:** Ruff for Python code quality

---

## 📈 Non-Functional Requirements

- Fast and smooth frontend performance.
- Comprehensive backend and frontend test coverage.
- No authentication in V1; planned for future versions.
- Code quality enforcement on both frontend and backend.

---

## 🔮 Future Considerations (Out of Scope for V1)

- User authentication and authorization.
- Packing list templates for different trip types.
- Sharing packing lists with other users.
- Weight estimation for luggage.
- Advanced analytics or AI-based packing suggestions.

---

## 🚀 Getting Started

Please refer to the project documentation for setup instructions, API details, and frontend usage.

---

Thank you for checking out **Trip Packer**! This project is both a personal tool and a learning platform — I hope it helps you pack smarter and stress less. ✈️🎒