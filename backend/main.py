import json
import random
import string
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import (
    TaskModel, ReceiptModel,
    TaskCreate, TaskOut,
    ReceiptCreate, ReceiptOut, ReceiptItem,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Depot API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ────────────────────────────────────────────────────────────────

def make_order_number() -> str:
    return "".join(random.choices(string.digits, k=5))


def task_to_out(t: TaskModel) -> TaskOut:
    return TaskOut(
        id=t.id,
        name=t.name,
        hours=t.hours,
        priority=t.priority,
        tags=t.tags,
        created_at=t.created_at,
    )


def serialize_receipt(r: ReceiptModel) -> ReceiptOut:
    return ReceiptOut(
        id=r.id,
        order_number=r.order_number,
        worker_name=r.worker_name,
        note=r.note,
        items=[ReceiptItem(**item) for item in r.items],
        total_hours=r.total_hours,
        created_at=r.created_at,
    )


# ── Task Endpoints ─────────────────────────────────────────────────────────

@app.get("/tasks", response_model=List[TaskOut])
def list_tasks(
    tag: Optional[str] = Query(None, description="Filter by tag"),
    db: Session = Depends(get_db),
):
    """Return all tasks, newest first. Optionally filter by tag."""
    tasks = db.query(TaskModel).order_by(TaskModel.created_at.desc()).all()
    if tag:
        tasks = [t for t in tasks if tag in t.tags]
    return [task_to_out(t) for t in tasks]


@app.get("/tasks/tags", response_model=List[str])
def list_all_tags(db: Session = Depends(get_db)):
    """Return all unique tags across all tasks, sorted alphabetically."""
    tasks = db.query(TaskModel).all()
    tag_set: set[str] = set()
    for t in tasks:
        tag_set.update(t.tags)
    return sorted(tag_set)


@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    if payload.hours <= 0:
        raise HTTPException(status_code=422, detail="Hours must be greater than 0")
    if payload.priority not in ("hi", "med", "lo"):
        raise HTTPException(status_code=422, detail="Priority must be hi, med, or lo")

    # Normalise tags: lowercase, strip whitespace, deduplicate, max 10
    clean_tags = list(dict.fromkeys(
        t.strip().lower() for t in payload.tags if t.strip()
    ))[:10]

    task = TaskModel(
        name=payload.name.strip(),
        hours=payload.hours,
        priority=payload.priority,
        tags_json=json.dumps(clean_tags),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task_to_out(task)


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# ── Receipt Endpoints ──────────────────────────────────────────────────────

@app.post("/receipts", response_model=ReceiptOut, status_code=201)
def create_receipt(payload: ReceiptCreate, db: Session = Depends(get_db)):
    if not payload.task_ids:
        raise HTTPException(status_code=422, detail="No tasks selected")

    tasks = db.query(TaskModel).filter(TaskModel.id.in_(payload.task_ids)).all()
    if not tasks:
        raise HTTPException(status_code=404, detail="None of the selected tasks were found")

    items_snapshot = [
        {"id": t.id, "name": t.name, "hours": t.hours, "priority": t.priority, "tags": t.tags}
        for t in tasks
    ]
    total_hours = sum(t.hours for t in tasks)

    while True:
        order_number = make_order_number()
        if not db.query(ReceiptModel).filter(ReceiptModel.order_number == order_number).first():
            break

    receipt = ReceiptModel(
        order_number=order_number,
        worker_name=payload.worker_name,
        note=payload.note,
        items_json=json.dumps(items_snapshot),
        total_hours=total_hours,
    )
    db.add(receipt)
    for task in tasks:
        db.delete(task)
    db.commit()
    db.refresh(receipt)
    return serialize_receipt(receipt)


@app.get("/receipts", response_model=List[ReceiptOut])
def list_receipts(db: Session = Depends(get_db)):
    receipts = db.query(ReceiptModel).order_by(ReceiptModel.created_at.desc()).all()
    return [serialize_receipt(r) for r in receipts]


@app.get("/receipts/{receipt_id}", response_model=ReceiptOut)
def get_receipt(receipt_id: int, db: Session = Depends(get_db)):
    r = db.query(ReceiptModel).filter(ReceiptModel.id == receipt_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return serialize_receipt(r)


# ── Serve Frontend (built dist) ────────────────────────────────────────────

app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
