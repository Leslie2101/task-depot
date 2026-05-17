# Task Depot

A vintage thermal-receipt todo app with a FastAPI + SQLite backend.

![alt text](images/image.png)
![alt text](images/image-1.png)
## Project structure

```
task-depot/
├── backend/
│   ├── main.py          # FastAPI app, all routes
│   ├── models.py        # SQLAlchemy models + Pydantic schemas
│   ├── database.py      # DB engine / session / Base
│   └── requirements.txt
└── frontend/
    └── index.html       # Single-file frontend (served by FastAPI)
```

## Quick start

### 1 — Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2 — Run the server

```bash
uvicorn main:app --reload
```

The server starts at **http://localhost:8000**.
FastAPI serves the frontend automatically — just open that URL in your browser.

### 3 — Explore the API docs

FastAPI generates interactive docs at:
- **http://localhost:8000/docs** — Swagger UI
- **http://localhost:8000/redoc** — ReDoc

---

## API reference

| Method   | Path                  | Description                                      |
|----------|-----------------------|--------------------------------------------------|
| `GET`    | `/tasks`              | List all open tasks (newest first)               |
| `POST`   | `/tasks`              | Create a task `{name, hours, priority}`          |
| `DELETE` | `/tasks/{id}`         | Delete a task by id                              |
| `POST`   | `/receipts`           | Checkout: save receipt, delete completed tasks   |
| `GET`    | `/receipts`           | List all past receipts (newest first)            |
| `GET`    | `/receipts/{id}`      | Get a single receipt by id                       |

### POST /tasks — request body
```json
{
  "name": "Write project proposal",
  "hours": 2.5,
  "priority": "hi"
}
```
`priority` must be one of `"hi"`, `"med"`, `"lo"`.

### POST /receipts — request body
```json
{
  "task_ids": [1, 3, 5],
  "worker_name": "Ada",
  "note": "Sprint 12 wrap-up"
}
```

---

## Database

SQLite file (`task_depot.db`) is created automatically in the `backend/` directory on first run. No setup required.

To switch to PostgreSQL, change one line in `database.py`:
```python
DATABASE_URL = "postgresql://user:password@localhost/task_depot"
```
Then `pip install psycopg2-binary`. Everything else stays the same.

---

## Deployment tips

- **Render / Railway**: point the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Docker**: use `python:3.12-slim`, copy both `backend/` and `frontend/`, expose port 8000
- **Production**: swap SQLite for PostgreSQL and set `allow_origins` in the CORS middleware to your actual domain
