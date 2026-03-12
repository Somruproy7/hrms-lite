from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.config.database import get_database
from app.models.employee import EmployeeCreate, EmployeeResponse


def serialize_employee(doc, present_days=0) -> dict:
    return {
        "id": str(doc["_id"]),
        "employeeId": doc["employeeId"],
        "fullName": doc["fullName"],
        "email": doc["email"],
        "department": doc["department"],
        "presentDays": present_days,
        "createdAt": doc.get("createdAt"),
    }


async def get_all_employees():
    try:
        db = get_database()
        employees = await db.employees.find().sort("createdAt", -1).to_list(None)
        result = []
        for emp in employees:
            present_days = await db.attendance.count_documents({
                "employeeId": str(emp["_id"]),
                "status": "Present"
            })
            result.append(serialize_employee(emp, present_days))
        return {"success": True, "data": result, "total": len(result)}
    except Exception as e:
        print(f"ERROR get_all_employees: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


async def get_employee_by_id(employee_id: str):
    try:
        db = get_database()
        try:
            oid = ObjectId(employee_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid employee ID format")
        emp = await db.employees.find_one({"_id": oid})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        present_days = await db.attendance.count_documents({
            "employeeId": employee_id,
            "status": "Present"
        })
        return {"success": True, "data": serialize_employee(emp, present_days)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR get_employee_by_id: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


async def create_employee(payload: EmployeeCreate):
    try:
        db = get_database()
        existing_id = await db.employees.find_one({"employeeId": payload.employeeId})
        if existing_id:
            raise HTTPException(status_code=409, detail=f"Employee ID '{payload.employeeId}' already exists")
        existing_email = await db.employees.find_one({"email": payload.email.lower()})
        if existing_email:
            raise HTTPException(status_code=409, detail=f"Email '{payload.email}' is already registered")
        doc = {
            "employeeId": payload.employeeId,
            "fullName": payload.fullName,
            "email": payload.email.lower(),
            "department": payload.department,
            "createdAt": datetime.utcnow(),
        }
        result = await db.employees.insert_one(doc)
        doc["_id"] = result.inserted_id
        return {"success": True, "data": serialize_employee(doc), "message": "Employee created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR create_employee: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


async def delete_employee(employee_id: str):
    try:
        db = get_database()
        try:
            oid = ObjectId(employee_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid employee ID format")
        emp = await db.employees.find_one({"_id": oid})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        await db.attendance.delete_many({"employeeId": employee_id})
        await db.employees.delete_one({"_id": oid})
        return {"success": True, "message": "Employee and related records deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR delete_employee: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


async def get_summary():
    try:
        db = get_database()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        total_employees = await db.employees.count_documents({})
        present_today = await db.attendance.count_documents({"date": today, "status": "Present"})
        absent_today = await db.attendance.count_documents({"date": today, "status": "Absent"})
        pipeline = [
            {"$group": {"_id": "$department", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        departments = await db.employees.aggregate(pipeline).to_list(None)
        departments = [{"_id": d["_id"], "count": d["count"]} for d in departments]
        return {
            "success": True,
            "data": {
                "totalEmployees": total_employees,
                "presentToday": present_today,
                "absentToday": absent_today,
                "departments": departments,
            }
        }
    except Exception as e:
        print(f"ERROR get_summary: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")
