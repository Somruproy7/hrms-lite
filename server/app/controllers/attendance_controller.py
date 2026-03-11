from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.config.database import get_database
from app.models.attendance import AttendanceCreate


def serialize_attendance(doc, employee_doc=None) -> dict:
    employee_info = None
    if employee_doc:
        employee_info = {
            "id": str(employee_doc["_id"]),
            "employeeId": employee_doc["employeeId"],
            "fullName": employee_doc["fullName"],
            "department": employee_doc["department"],
            "email": employee_doc.get("email", ""),
        }
    return {
        "id": str(doc["_id"]),
        "employee": employee_info,
        "date": doc["date"],
        "status": doc["status"],
        "createdAt": doc.get("createdAt"),
    }


async def get_all_attendance(date: str = None, employee_id: str = None):
    db = get_database()
    query = {}
    if date:
        query["date"] = date
    if employee_id:
        query["employeeId"] = employee_id

    records = await db.attendance.find(query).sort("date", -1).to_list(None)

    result = []
    for rec in records:
        emp = None
        if rec.get("employeeId"):
            try:
                emp = await db.employees.find_one({"_id": ObjectId(rec["employeeId"])})
            except Exception:
                pass
        result.append(serialize_attendance(rec, emp))

    return {"success": True, "data": result, "total": len(result)}


async def get_attendance_by_employee(employee_id: str, date: str = None):
    db = get_database()
    try:
        ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID format")

    emp = await db.employees.find_one({"_id": ObjectId(employee_id)})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    query = {"employeeId": employee_id}
    if date:
        query["date"] = date

    records = await db.attendance.find(query).sort("date", -1).to_list(None)

    present_days = sum(1 for r in records if r["status"] == "Present")
    absent_days = sum(1 for r in records if r["status"] == "Absent")

    result = [serialize_attendance(r, emp) for r in records]

    return {
        "success": True,
        "data": result,
        "total": len(result),
        "stats": {"presentDays": present_days, "absentDays": absent_days}
    }


async def mark_attendance(payload: AttendanceCreate):
    db = get_database()

    # Validate employee exists
    try:
        oid = ObjectId(payload.employeeId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID format")

    emp = await db.employees.find_one({"_id": oid})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Upsert attendance
    now = datetime.utcnow()
    result = await db.attendance.find_one_and_update(
        {"employeeId": payload.employeeId, "date": payload.date},
        {"$set": {
            "employeeId": payload.employeeId,
            "date": payload.date,
            "status": payload.status,
            "updatedAt": now,
        }, "$setOnInsert": {"createdAt": now}},
        upsert=True,
        return_document=True,
    )

    return {
        "success": True,
        "data": serialize_attendance(result, emp),
        "message": f"Attendance marked as {payload.status} for {emp['fullName']} on {payload.date}"
    }


async def delete_attendance(attendance_id: str):
    db = get_database()
    try:
        oid = ObjectId(attendance_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid attendance ID format")

    record = await db.attendance.find_one({"_id": oid})
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    await db.attendance.delete_one({"_id": oid})
    return {"success": True, "message": "Attendance record deleted"}
