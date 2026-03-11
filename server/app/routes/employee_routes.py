from fastapi import APIRouter
from app.models.employee import EmployeeCreate
from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    delete_employee,
    get_summary,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/summary")
async def summary():
    return await get_summary()


@router.get("")
async def list_employees():
    return await get_all_employees()


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    return await get_employee_by_id(employee_id)


@router.post("", status_code=201)
async def add_employee(payload: EmployeeCreate):
    return await create_employee(payload)


@router.delete("/{employee_id}")
async def remove_employee(employee_id: str):
    return await delete_employee(employee_id)
