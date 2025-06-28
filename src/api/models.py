from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column
import datetime
from datetime import date, datetime
db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    gh_login: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    # member_since: Mapped[date] = mapped_column(Date(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            "gh_login": self.gh_login,
            "username": self.username,
            "is_active": self.is_active,
            # "member_since": self.member_since,
            # do not serialize the password, its a security breach
        }
        print('hello world')
