# Database Migration Documentation

This document describes how to manage database migrations using Alembic and SQLAlchemy.

## 1. Prerequisites

- Python 3.x installed.
- Virtual environment configured:
    ```bash
    python -m venv venv
    ```
- Alembic and SQLAlchemy installed:

    ```bash
    pip install alembic sqlalchemy
    ```

- PostgreSQL database configured.

## 2. Alembic Initialization

When starting a new project or if you need to create migrations from scratch, follow these steps:

### 2.1 Create a Migrations Folder

All alembic configuration is already implemented in the repo but in case of need, run the following command in the backend to initialize Alembic:

```bash
alembic init alembic
```

This command will create the `alembic` folder containing:

- `versions/`: where migration scripts are stored.
- `env.py`: Alembic configuration file.
- `alembic.ini`: database configuration file.

### 2.2 Install and configure PostgreSQL

Follow the [documentation from the oficial site](https://www.postgresql.org/docs/) to install and configure PostgreSQL in your PC. Remember to create your database with the name **'referaidb'**.

### 2.3 Configure the Database URL

As you will find, the `alembic/env.py` from the repository scopes to:
```bash
db_url = os.getenv("DB_URL")
```
This means you have to write the url into your `.env` and alembic will get it from there. If you haven't created yet, copy the `.env.example` file and create your `.env`. Your url should look like these:
```bash
DB_URL=postgresql+psycopg2://postgreuser:postgrepassword@localhost/referaidb
```
Replace *postgreuser* and *postgrepassword* with your user and password from PostgreSQL. 

### 2.4 Database Model

You can see how the model is in `backend/app/db/models.py`.

## 3. Generating Migrations

### 3.1 Run Existing Migrations

An initial migration with its population is already defined in `backend/alembic/versions/`. This migration creates the database structure and populates and user with an already predicted action. The data from the prediction is completely random. To run this initial migrations:

```bash
alembic upgrade head
```

This will automatically locate the existing migrations and execute them. Once this is done, you can access to the system using the following credentials:
- User: 'admin@admin.com'.
- Password: 'admin@admin.com'.

### 3.2 Modify Database

To generate a new migration reflecting new database structure, run:

```bash
alembic revision --autogenerate -m "Name of migration"
```

This command creates a migration file in `alembic/versions/` describing the necessary changes to create tables and relationships according to your model.

Then, run the command:

```bash
alembic upgrade head
```

This will run all pending migrations up to the latest version.

## 4. Data Population Migrations

If you need to populate data in the database as part of a migration (for example, to add default data), you can edit the existing script called `xxxx_populate_initial_data.py` or create a script inside your migration file using the `upgrade()` function.

Example of how to add data to tables during a migration:

```python
from alembic import op
from sqlalchemy.orm import Session
from app.db.models import User

def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    # Add a default user
    user = User(name="Admin", email="admin@example.com")
    session.add(user)
    session.commit()
```

### 4.1 Test File Directory

If you are using test files (e.g., clips or images), make sure they are located in an accessible directory within the repository. You can place these files in a specific directory inside `alembic/versions/`, such as `videos/` or `data/`.

Example of how to reference those files in the migration script:

```python
import os

current_dir = os.path.dirname(__file__)
clip_dir = os.path.join(current_dir, "..", "videos")

clip_path_1 = os.path.join(clip_dir, "clip_1")
clip_path_2 = os.path.join(clip_dir, "clip_2")

# Read and add the clips
```

### 4.2 Data Deletion and Cleanup

If you want to delete specific data or clean up certain records during a downgrade migration, you can do so as follows:

```python
def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    # Delete a user
    user = session.query(User).filter(User.email == "admin@example.com").first()
    if user:
        session.delete(user)
        session.commit()
```

## 5. Review Alembic History

In case you need to see migrations history just run the following command:

```bash
alembic history --verbose
```

This command will show a detailed and ordered history of the implemented migrations.

## 6. Important Considerations

- **Database Backup:** Always back up your database before performing migrations, especially when making destructive changes.
- **Version Control:** Keep your migrations under version control to track changes and facilitate team collaboration. This means pushing all migrations into the Git Repo.
- **Error Handling:** Make sure to handle errors properly during the migration process and test migrations in a development environment before running them in production.
