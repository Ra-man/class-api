import { Injectable, NotFoundException } from '@nestjs/common'
import { Cart, CartItem } from 'src/model/Cart'

@Injectable()
export class CartService {
  private carts: Cart[] = []

  // Cria ou retorna o carrinho
  getCart(cartId: string): Cart {
    let cart = this.carts.find(c => c.id === cartId)
    if (!cart) {
      cart = { id: cartId, items: [] }
      this.carts.push(cart)
    }
    return cart
  }

  // Adiciona item
  addItem(cartId: string, item: CartItem): Cart {
    const cart = this.getCart(cartId)
    const existing = cart.items.find(i => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.items.push(item)
    }
    return cart
  }

  // Atualiza quantidade de item
  updateItem(cartId: string, item: CartItem): Cart {
    const cart = this.getCart(cartId)
    const existing = cart.items.find(i => i.productId === item.productId)
    if (!existing) throw new NotFoundException('Item não encontrado no carrinho')
    existing.quantity = item.quantity
    return cart
  }

  // Remove item
  removeItem(cartId: string, productId: string): Cart {
    const cart = this.getCart(cartId)
    const index = cart.items.findIndex(i => i.productId === productId)
    if (index === -1) throw new NotFoundException('Item não encontrado no carrinho')
    cart.items.splice(index, 1)
    return cart
  }
}
