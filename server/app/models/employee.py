from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class EmployeeCreate(BaseModel):
    employeeId: str
    fullName: str
    email: EmailStr
    department: str

    @field_validator("employeeId")
    @classmethod
    def employee_id_not_empty(cls, v):
        v = v.strip().upper()
        if not v:
            raise ValueError("Employee ID is required")
        return v

    @field_validator("fullName")
    @classmethod
    def full_name_valid(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Full name is required")
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v

    @field_validator("department")
    @classmethod
    def department_valid(cls, v):
        allowed = [
            "Engineering", "Marketing", "Sales", "HR",
            "Finance", "Operations", "Design", "Legal", "Other"
        ]
        if v not in allowed:
            raise ValueError(f"Department must be one of: {', '.join(allowed)}")
        return v


class EmployeeResponse(BaseModel):
    id: str
    employeeId: str
    fullName: str
    email: str
    department: str
    presentDays: Optional[int] = 0
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
