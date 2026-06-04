import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Request() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMine(@Request() req: AuthRequest) {
    return this.ordersService.findByCustomer(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    // pass the logged-in user so the service can enforce role-based access
    return this.ordersService.findById(id, req.user);
  }
}
