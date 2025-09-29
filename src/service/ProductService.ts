import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { Product } from 'src/model/Product'
import { products } from '../data/Products'
import { ProductGql } from 'src/model/ProductGql'

@Injectable()
export class ProductService {
  // Injeta o gerenciador de cache
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findProductById(id: string): Promise<Product> {
    // O tipo de retorno agora é uma Promise, pois a operação de cache é assíncrona
    return this.findProduct(id)
  }

  async findProductGqlById(id: string): Promise<ProductGql> {
    return this.findProduct(id)
  }

  /**
   * Método privado que centraliza a lógica de busca com cache.
   */
  private async findProduct(id: string): Promise<Product> {
    const cacheKey = `PRODUCT_${id}`

    // 1. Tenta buscar o produto do cache
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey)

    if (cachedProduct) {
      console.log(`Cache HIT para o produto: ${id}`)
      return cachedProduct
    }

    console.log(`Cache MISS para o produto: ${id}`)
    // 2. Se não estiver no cache, busca na fonte de dados (aqui, o array)
    const product = products.find(p => p.id === id)

    if (!product) {
      throw new NotFoundException('Produto não encontrado')
    }

    // 3. Salva o produto encontrado no cache para futuras requisições
    await this.cacheManager.set(cacheKey, product)

    return product
  }
}
