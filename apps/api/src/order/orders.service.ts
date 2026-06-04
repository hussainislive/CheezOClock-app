import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { UserRole } from '@food-delivery/types';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const menuItemIds = dto.items.map((i) => i.menuItemId);

    // fetch all menu items in one query
    const menuItems = await this.db
      .select()
      .from(schema.menuItems)
      .where(inArray(schema.menuItems.id, menuItemIds));

    // verify all menu item IDs were actually found in the DB
    // if any ID is invalid, menuItems.length < dto.items.length
    // without this check, find() returns undefined and total becomes NaN
    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    // verify all items belong to the specified restaurant
    const allBelongToRestaurant = menuItems.every(
      (item) => item.restaurantId === dto.restaurantId,
    );

    if (!allBelongToRestaurant) {
      throw new BadRequestException(
        'All items must belong to the same restaurant',
      );
    }

    // calculate total server-side — never trust the client's price
    const total = dto.items.reduce((sum, orderItem) => {
      const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
      if (!menuItem) return sum;
      return sum + parseFloat(menuItem.price) * parseInt(orderItem.quantity);
    }, 0);

    // insert the order
    const [order] = await this.db
      .insert(schema.orders)
      .values({
        customerId,
        restaurantId: dto.restaurantId,
        deliveryAddress: dto.deliveryAddress,
        totalAmount: total.toFixed(2),
        status: 'PENDING',
      })
      .returning();

    // insert all order items
    await this.db.insert(schema.orderItems).values(
      dto.items.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
        return {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price, // snapshot the price at time of order
        };
      }),
    );

    return order;
  }

  async findByCustomer(customerId: string) {
    return this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.customerId, customerId));
  }

  async findById(id: string, user: { sub: string; role: string }) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id));

    if (!order) throw new NotFoundException('Order not found');

    // check access by role — each role can only view orders they're involved in
    // we use the same NotFoundException message regardless — avoids leaking whether the order exists
    const canView =
      (user.role === UserRole.CUSTOMER && order.customerId === user.sub) ||
      (user.role === UserRole.RESTAURANT_OWNER &&
        (await this.isOwnerOfRestaurant(user.sub, order.restaurantId))) ||
      (user.role === UserRole.DRIVER && order.driverId === user.sub);

    if (!canView) throw new NotFoundException('Order not found');

    const items = await this.db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    return { ...order, items };
  }

  private async isOwnerOfRestaurant(ownerId: string, restaurantId: string) {
    // one restaurant per owner — single query is enough
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    return restaurant?.id === restaurantId;
  }
}
