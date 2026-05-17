from datetime import datetime
from typing import List, Optional
import json

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from pydantic import BaseModel

from database import Base


# ── SQLAlchemy ORM Models ──────────────────────────────────────────────────

class TaskModel(Base):
    __tablename__ = "tasks"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), nullable=False)
    hours      = Column(Float, nullable=False)
    priority   = Column(String(10), nullable=False, default="med")  # hi | med | lo
    tags_json  = Column(Text, nullable=False, default="[]")          # JSON string[]
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def tags(self) -> List[str]:
        return json.loads(self.tags_json)


class ReceiptModel(Base):
    __tablename__ = "receipts"

    id           = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(10), unique=True, index=True)
    worker_name  = Column(String(100), nullable=True)
    note         = Column(Text, nullable=True)
    items_json   = Column(Text, nullable=False)   # JSON list of completed tasks
    total_hours  = Column(Float, nullable=False)
    created_at   = Column(DateTime, default=datetime.utcnow)

    @property
    def items(self):
        return json.loads(self.items_json)


# ── Pydantic Schemas ───────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    name:     str
    hours:    float
    priority: str = "med"
    tags:     List[str] = []


class TaskOut(BaseModel):
    id:         int
    name:       str
    hours:      float
    priority:   str
    tags:       List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReceiptItem(BaseModel):
    id:       int
    name:     str
    hours:    float
    priority: str
    tags:     List[str] = []


class ReceiptCreate(BaseModel):
    task_ids:    List[int]
    worker_name: Optional[str] = None
    note:        Optional[str] = None


class ReceiptOut(BaseModel):
    id:           int
    order_number: str
    worker_name:  Optional[str]
    note:         Optional[str]
    items:        List[ReceiptItem]
    total_hours:  float
    created_at:   datetime

    class Config:
        from_attributes = True
