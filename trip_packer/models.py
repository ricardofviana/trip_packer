from datetime import datetime
from enum import Enum

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, registry, relationship

table_registry = registry()


class ItemStatus(str, Enum):
    UNPACKED = "UNPACKED"
    PACKED = "PACKED"
    TO_BUY = "TO_BUY"


class LuggageType(str, Enum):
    BACKPACK = "BACKPACK"
    CARRY_ON = "CARRY_ON"
    CHECKED_MEDIUM = "CHECKED_MEDIUM"
    CHECKED_LARGE = "CHECKED_LARGE"


class ItemCategory(str, Enum):
    CLOTHING = "CLOTHING"
    ELECTRONICS = "ELECTRONICS"
    TOILETRIES = "TOILETRIES"
    DOCUMENTS = "DOCUMENTS"
    MEDICATION = "MEDICATION"
    ACCESSORIES = "ACCESSORIES"
    OTHER = "OTHER"


@table_registry.mapped_as_dataclass
class Item:
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    category: Mapped[ItemCategory] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    item_luggage: Mapped[list["ItemLuggage"]] = relationship(init=False, back_populates="item")


@table_registry.mapped_as_dataclass
class Luggage:
    __tablename__ = "luggage"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[LuggageType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    luggage_trips: Mapped[list["LuggageTrip"]] = relationship(init=False, back_populates="luggage")


@table_registry.mapped_as_dataclass
class Trip:
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    start_date: Mapped[datetime]
    end_date: Mapped[datetime]
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    luggage_trips: Mapped[list["LuggageTrip"]] = relationship(init=False, back_populates="trip")


@table_registry.mapped_as_dataclass
class ItemLuggage:
    __tablename__ = "item_luggage"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    luggage_id: Mapped[int] = mapped_column(ForeignKey("luggage.id"))
    status: Mapped[ItemStatus] = mapped_column(default=ItemStatus.UNPACKED)
    quantity: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    item: Mapped["Item"] = relationship(init=False, back_populates="item_luggage")
    luggage_trip: Mapped["LuggageTrip"] = relationship(
        init=False, foreign_keys=[luggage_id], primaryjoin="ItemLuggage.luggage_id == LuggageTrip.luggage_id"
    )


@table_registry.mapped_as_dataclass
class LuggageTrip:
    __tablename__ = "luggage_trip"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    luggage_id: Mapped[int] = mapped_column(ForeignKey("luggage.id"))
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    luggage: Mapped["Luggage"] = relationship(init=False, back_populates="luggage_trips")
    trip: Mapped["Trip"] = relationship(init=False, back_populates="luggage_trips")
    item_luggage: Mapped[list["ItemLuggage"]] = relationship(
        init=False,
        foreign_keys=[ItemLuggage.luggage_id],
        primaryjoin="LuggageTrip.luggage_id == ItemLuggage.luggage_id",
        viewonly=True,
    )
