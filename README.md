## Why I built this project

I have a confession to make: I'm one of those people who *always* forgets something when packing for a trip. It doesn't matter if it's a weekend getaway or a month-long vacation, something essential is inevitably left behind.

Of course, a simple checklist on a piece of paper or a notes app would probably solve this problem. But where's the fun in that?

The real motivation behind building Trip Packer was two fold:

1.  **To put my skills to the test:** I wanted to apply the concepts and techniques I learned in the [FastAPI do Zero](https://fastapidozero.dunossauro.com/estavel/) course in a real-world project. This application is my playground for everything I've learned.

2.  **To create a project template:** I wanted to build a well-structured and reusable project that I can use as a template for future applications. This allows me to quickly bootstrap new ideas and experiment with different technologies without starting from scratch every time.

So, while Trip Packer solves a personal pain point, it'''s also a learning tool and a foundation for future projects.

## Project Description

Trip Packer is a web application designed to help you plan and organize your packing for any trip. It allows you to create trips, manage your luggage, and create a comprehensive packing list to ensure you never forget an essential item again.

### Main Features

*   **Trip Management:** Create, update, and delete trips.
*   **Luggage Organization:** Add and manage different types of luggage for your trips.
*   **Packing Lists:** Create detailed packing lists for each trip, ensuring you have everything you need.

### Technologies Used

*   **Backend:**
    *   [FastAPI](https://fastapi.tiangolo.com/): A modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.
    *   [SQLAlchemy](https://www.sqlalchemy.org/): The Python SQL toolkit and Object Relational Mapper that gives application developers the full power and flexibility of SQL.
    *   [Alembic](https://alembic.sqlalchemy.org/en/latest/): A lightweight database migration tool for usage with the SQLAlchemy Database Toolkit for Python.
    *   [Pydantic](https://pydantic-docs.helpmanual.io/): Data validation and settings management using python type annotations.
    *   [PostgreSQL](https://www.postgresql.org/): A powerful, open source object-relational database system.
*   **Testing:**
    *   [Pytest](https://docs.pytest.org/en/7.1.x/): A framework that makes it easy to write small, readable tests, and can scale to support complex functional testing for applications and libraries.
    *   [Testcontainers](https://testcontainers-python.readthedocs.io/en/latest/): A Python library that provides a friendly API to run Docker containers. It'''s designed to be used in tests to create a clean, isolated environment for your tests.
*   **Linting and Formatting:**
    *   [Ruff](https://github.com/astral-sh/ruff): An extremely fast Python linter, written in Rust.

