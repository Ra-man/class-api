// src/app.module.ts
import { Module } from '@nestjs/common'
import { CacheModule, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProductService } from './service/ProductService'
import { CartService } from './service/CartService'
import { CartController } from './controller/CartController'
import { ProductResolver } from './app.resolver'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import * as redisStore from 'cache-manager-redis-store'

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Make the ca-che module available globally
      store: redisStore,
      host: 'localhost', // or your redis host
      port: 6379, // or your redis port
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
  controllers: [AppController, CartController],
  providers: [AppService, ProductService, CartService, ProductResolver],
})
export class AppModule {}
