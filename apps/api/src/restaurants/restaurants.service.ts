import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

  async create(ownerId: string, dto: CreateRestaurantDto) {
    const [existing] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (existing) {
      throw new ForbiddenException('You already have a restaurant');
    }

    const [restaurant] = await this.db
      .insert(schema.restaurants)
      .values({
        ownerId,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        cuisineType: dto.cuisineType,
        imageUrl: dto.imageUrl,
      })
      .returning();

    return restaurant;
  }

  async findMine(ownerId: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    return restaurant ?? null;
  }

  async findById(id: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findAll() {
    return this.db.select().from(schema.restaurants);
  }

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    const [updated] = await this.db
      .update(schema.restaurants)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.restaurants.id, id))
      .returning();

    return updated;
  }
}
