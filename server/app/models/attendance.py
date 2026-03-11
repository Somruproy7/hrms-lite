from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re


class AttendanceCreate(BaseModel):
    employeeId: str
    date: str
    status: str

    @field_validator("date")
    @classmethod
    def date_format_valid(cls, v):
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        if v not in ["Present", "Absent"]:
            raise ValueError("Status must be Present or Absent")
        return v


class AttendanceEmployeeInfo(BaseModel):
    id: str
    employeeId: str
    fullName: str
    department: str
    email: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    employee: Optional[AttendanceEmployeeInfo] = None
    date: str
    status: str
    createdAt: Optional[datetime] = None
