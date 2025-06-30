from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Date, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
import enum
import datetime
from datetime import date, datetime, UTC
db = SQLAlchemy()


class Stack(enum.Enum):
    HTML = "HTML"
    CSS = "CSS"
    JAVASCRIPT = "JavasScript"
    PYTHON = "Python"
    SQL = "SQL"


class Level(enum.Enum):
    STUDENT = "student"
    JUNIOR_DEV = "junior_dev"
    MID_DEV = "mid_dev"
    SENIOR_DEV = "senior_dev"


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    # gh_login: Mapped[str] = mapped_column(
    #     String(120), unique=True, nullable=False) #en tabla aparte con User como FK, se usará una librería para eso
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)  # no incluir en formulario
    member_since: Mapped[date] = mapped_column(
        # no incluir en formulario, se llena automáticamente
        Date(), nullable=False, default=datetime.now(UTC))
    stack: Mapped[enum.Enum] = mapped_column(Enum(Stack), nullable=True)
    level: Mapped[enum.Enum] = mapped_column(Enum(Level), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            # "gh_login": self.gh_login,
            "username": self.username,
            "is_active": self.is_active,
            "stack": self.stack,
            "level": self.level,
            "member_since": self.member_since,
            # do not serialize the password, its a security breach
        }
        print('hello world')


class Post(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    title: Mapped[str] = mapped_column(String(40), nullable=True)
    image_URL: Mapped[str] = mapped_column(String(2083), nullable=True)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    repo_URL: Mapped[str] = mapped_column(String(2083), nullable=False)

    def serialize(self):
        return {
            "id": self. id,
            "user_id": self.user_id,
            "title": self.title,
            "image_URL": self.image_URL,
            "desciption": self.description,
            "repo_URL": self.repo_URL
        }


class Favorites(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    post_id: Mapped[int] = mapped_column(ForeignKey(Post.id))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }


class Comments(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    post_id: Mapped[int] = mapped_column(ForeignKey(Post.id))
    title: Mapped[str] = mapped_column(String(40), nullable=True)
    text: Mapped[str] = mapped_column(String(120), nullable=False)
    date_added: Mapped[date] = mapped_column(
        # cambiar a que muestre hora (datetime en los corchetes no funcionó)
        nullable=False, default=datetime.now(UTC))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "title": self.title,
            "text": self.text,
            "date_added": self.date_added,
        }


class Likes(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    post_id: Mapped[int] = mapped_column(ForeignKey(Post.id))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }
