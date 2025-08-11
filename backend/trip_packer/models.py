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
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    category: Mapped[ItemCategory] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    packings: Mapped[list["Packing"]] = relationship(init=False, back_populates="item")
    trip_items: Mapped[list["TripItem"]] = relationship(init=False, back_populates="item")


@table_registry.mapped_as_dataclass
class Bag:
    __tablename__ = "bags"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    type: Mapped[LuggageType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip_bags: Mapped[list["TripBag"]] = relationship(init=False, back_populates="bag")
    packings: Mapped[list["Packing"]] = relationship(init=False, back_populates="bag")


@table_registry.mapped_as_dataclass
class Trip:
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    start_date: Mapped[datetime]
    end_date: Mapped[datetime]
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip_bags: Mapped[list["TripBag"]] = relationship(init=False, back_populates="trip")
    packings: Mapped[list["Packing"]] = relationship(init=False, back_populates="trip")
    trip_items: Mapped[list["TripItem"]] = relationship(init=False, back_populates="trip")

    @property
    def bags(self) -> list["Bag"]:
        return [trip_bag.bag for trip_bag in self.trip_bags]


@table_registry.mapped_as_dataclass
class TripBag:
    __tablename__ = "trip_bags"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    bag_id: Mapped[int] = mapped_column(ForeignKey("bags.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip: Mapped["Trip"] = relationship(init=False, back_populates="trip_bags")
    bag: Mapped["Bag"] = relationship(init=False, back_populates="trip_bags")


@table_registry.mapped_as_dataclass
class TripItem:
    __tablename__ = "trip_items"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=1)
    status: Mapped[ItemStatus] = mapped_column(default=ItemStatus.UNPACKED)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip: Mapped["Trip"] = relationship(init=False, back_populates="trip_items")
    item: Mapped["Item"] = relationship(init=False, back_populates="trip_items")


@table_registry.mapped_as_dataclass
class Packing:
    __tablename__ = "packings"
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), primary_key=True)
    bag_id: Mapped[int] = mapped_column(ForeignKey("bags.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=1)
    status: Mapped[ItemStatus] = mapped_column(default=ItemStatus.UNPACKED)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip: Mapped["Trip"] = relationship(init=False, back_populates="packings")
    item: Mapped["Item"] = relationship(init=False, back_populates="packings")
    bag: Mapped["Bag"] = relationship(init=False, back_populates="packings")
