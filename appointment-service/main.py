from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://clinica_user:clinica_password@postgres:5432/clinica_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo de Base de Datos
class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(String, default="SCHEDULED")  # SCHEDULED, CANCELLED, COMPLETED
    notes = Column(String, nullable=True)

# Crear las tablas (En un entorno real se usan migraciones como Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Service")

# Esquemas Pydantic para Validar los requests
class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    date: datetime
    notes: str | None = None

class AppointmentResponse(AppointmentCreate):
    id: int
    status: str

    class Config:
        from_attributes = True

# Dependencia para la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "Appointment service (Python/FastAPI) is up and running"}

@app.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@app.get("/", response_model=list[AppointmentResponse])
def get_appointments(patient_id: int = None, doctor_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    return query.all()

@app.patch("/{appointment_id}/status")
def update_status(appointment_id: int, status: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    db.commit()
    return {"message": "Status updated", "status": status}
