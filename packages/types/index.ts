export const UserRole = {
    CUSTOMER: "CUSTOMER",
    RESTAURANT_OWNER: 'RESTAURANT_OWNER',
    DRIVER: 'DRIVER'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
}

export interface HealthCheckResponse {
    status: string;
    timestamp: Date;
}

export interface JwtPayload {
    sub: string 
    email: string
    role: string
}

export interface RestaurantType {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  cuisineType: string;
  isOpen: boolean;
  rating: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}