from fastapi import APIRouter
from typing import Optional
from app.models.attendance import AttendanceCreate
from app.controllers.attendance_controller import (
    get_all_attendance,
    get_attendance_by_employee,
    mark_attendance,
    delete_attendance,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("")
async def list_attendance(date: Optional[str] = None, employeeId: Optional[str] = None):
    return await get_all_attendance(date=date, employee_id=employeeId)


@router.get("/employee/{employee_id}")
async def get_employee_attendance(employee_id: str, date: Optional[str] = None):
    return await get_attendance_by_employee(employee_id, date=date)


@router.post("", status_code=201)
async def add_attendance(payload: AttendanceCreate):
    return await mark_attendance(payload)


@router.delete("/{attendance_id}")
async def remove_attendance(attendance_id: str):
    return await delete_attendance(attendance_id)
