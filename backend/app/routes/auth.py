import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_db, User

router = APIRouter()
SECRET = "pyclima_technex26_jwt_secret"
ALGO   = "HS256"

class AuthBody(BaseModel):
    username: str
    password: str

def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def _make_token(username: str):
    return jwt.encode(
        {"sub": username, "exp": datetime.utcnow() + timedelta(hours=24)},
        SECRET, algorithm=ALGO
    )

@router.post("/signup")
def signup(body: AuthBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, detail="Username already taken.")
    hashed = _hash_password(body.password)
    db.add(User(username=body.username, hashed_password=hashed))
    db.commit()
    return {"message": "Registered successfully. Please log in."}

@router.post("/login")
def login(body: AuthBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not _verify_password(body.password, user.hashed_password):
        raise HTTPException(401, detail="Invalid username or password.")
    return {"access_token": _make_token(body.username), "token_type": "bearer", "username": body.username}
