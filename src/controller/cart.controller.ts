import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { CartService } from 'src/service/CartService'
import { CartItem } from 'src/model/CartItem'

@Controller('cart/:cartId')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId)
  }

  @Post('item')
  addItem(@Param('cartId') cartId: string, @Body() item: CartItem) {
    return this.cartService.addItem(cartId, item)
  }

  @Put('item')
  updateItem(@Param('cartId') cartId: string, @Body() item: CartItem) {
    return this.cartService.updateItem(cartId, item)
  }

  @Delete('item/:productId')
  removeItem(@Param('cartId') cartId: string, @Param('productId') productId: string) {
    return this.cartService.removeItem(cartId, productId)
  }
}


