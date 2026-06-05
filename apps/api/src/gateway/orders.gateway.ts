import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    client.join(`order:${orderId}`);
    console.log(`Client ${client.id} joined order:${orderId}`);
  }

  @SubscribeMessage('join:restaurant')
  handleJoinRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ) {
    client.join(`restaurant:${restaurantId}`);
    console.log(`Client ${client.id} joined restaurant:${restaurantId}`);
  }

  emitOrderUpdate(order: {
    id: string;
    restaurantId: string;
    status: string;
    [key: string]: unknown;
  }) {
    // → customer watching this order
    this.server.to(`order:${order.id}`).emit('order:updated', order);
    // → owner dashboard for this restaurant
    this.server
      .to(`restaurant:${order.restaurantId}`)
      .emit('order:updated', order);
  }
}
