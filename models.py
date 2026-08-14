#SQLAlchemy models that transform SQL to python objects for better interactions

#docs: https://www.sqlalchemy.org/
#docs: https://flask-sqlalchemy.readthedocs.io/en/stable/


from app import db
from sqlalchemy import func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date

class Board(db.Model): #Top level container
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(primary_key= True)
    name: Mapped[str] = mapped_column(nullable= False)
    created_at: Mapped[datetime] = mapped_column(server_default= func.now())

class List(db.Model): #Each list belong to one board; columns inside a board (like "To Do", "In Progress", "Done")
    __tablename__ = "lists"

    id: Mapped[int] = mapped_column(primary_key= True)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"),nullable= False)
    name: Mapped[str] = mapped_column(nullable= False)
    position: Mapped[int | None] = mapped_column()

class Card(db.Model): #Individual tasks inside a list
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key= True)
    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id", ondelete="CASCADE"),nullable= False)
    title: Mapped[str] = mapped_column(nullable= False)
    description: Mapped[str | None] = mapped_column()
    due_date: Mapped[date | None] = mapped_column()
    position: Mapped[int | None] = mapped_column()

class Label(db.Model): #Reusable tags with colors (Urgent", "Bug", "Feature, etc)
    __tablename__ = "labels"

    id: Mapped[int] = mapped_column(primary_key = True)
    label: Mapped[str] = mapped_column(nullable = False)
    color: Mapped[str] = mapped_column(nullable = False)


class CardLabel(db.Model): #uses composite primary keys to ensure same pair can't be inserted twice; junction table to link cards and labels tables
    __tablename__ = "card_labels"

    card_id: Mapped[int] = mapped_column(ForeignKey("cards.id", ondelete="CASCADE"), primary_key= True)
    label_id : Mapped[int] = mapped_column(ForeignKey("labels.id", ondelete="CASCADE"), primary_key= True)
