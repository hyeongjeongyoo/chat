export interface RoomImage {
  src: string;
}

export interface Seminar {
  name: string;
  location: string;
  maxPeople: number;
  area: string;
  price: number;
  images: RoomImage[];
}

export interface Room {
  name: string;
  roomType: string;
  bedType: string;
  area: string;
  weekdayPrice: number;
  weekendPrice: number;
  images: RoomImage[];
  amenities: string[];
}

export type EstimateService = "seminar" | "room";

export interface CartItem {
  id: string; // Unique ID for this cart entry
  productId: string; // ID of the product (e.g., "grand-ballroom")
  type: EstimateService;
  name: string;
  checkInDate: Date;
  checkOutDate: Date;
  quantity: number;
}
