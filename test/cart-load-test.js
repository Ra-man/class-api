import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { uuidv4 } from 'https/jslib/k6-utils/1.4.0/index.js';

// Carrega os dados dos produtos para usar nos testes
const productsData = new SharedArray('products', function () {
  // ATENÇÃO: O k6 não tem acesso direto ao seu filesystem.
  // Você precisa carregar o conteúdo do seu arquivo de produtos aqui.
  // Por simplicidade, colei uma versão resumida.
  // Em um cenário real, você pode ler o JSON de um arquivo.
  // const productsJson = open('./data/products.json');
  // return JSON.parse(productsJson);
  return [
    { id: '1', name: 'Smartphone Galaxy Pro' },
    { id: '2', name: 'Notebook Gamer Ultra' },
    { id: '3', name: 'Fone Bluetooth Premium' },
    { id: '5', name: 'Tablet Pro 12"' },
    { id: '6', name: 'Smartwatch Elite Series' },
    { id: '8', name: 'Console Gaming Pro X' },
  ];
});

// Configuração do teste
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Rampa de 0 a 20 usuários virtuais em 30s
    { duration: '1m', target: 20 },  // Mantém 20 usuários por 1 minuto
    { duration: '10s', target: 0 },  // Rampa para 0 usuários
  ],
  thresholds: {
    // 95% das requisições devem terminar em menos de 800ms
    http_req_duration: ['p(95)<800'],
    // Nenhuma requisição deve falhar
    http_req_failed: ['rate<0.01'],
  },
};

const API_URL = 'http://localhost:3000/graphql';
const HEADERS = { 'Content-Type': 'application/json' };

// Função principal do teste, executada por cada usuário virtual
export default function () {
  // 1. Simula um usuário obtendo um carrinho
  const cartId = uuidv4(); // Gera um ID de carrinho único para cada usuário virtual

  const getCartQuery = JSON.stringify({
    query: `
      query GetCart($cartId: String!) {
        cart(id: $cartId) {
          id
          items {
            productId
            quantity
          }
        }
      }
    `,
    variables: { cartId },
  });

  const getCartRes = http.post(API_URL, getCartQuery, { headers: HEADERS });
  check(getCartRes, { 'getCart: status was 200': (r) => r.status === 200 });

  sleep(1); // Pausa de 1 segundo

  // 2. Simula o usuário adicionando um item aleatório ao carrinho
  const randomProduct = productsData[Math.floor(Math.random() * productsData.length)];

  const addItemMutation = JSON.stringify({
    query: `
      mutation AddItemToCart($cartId: String!, $productId: String!, $quantity: Int!) {
        addItem(item: { cartId: $cartId, productId: $productId, quantity: $quantity }) {
          id
          items {
            productId
            quantity
          }
        }
      }
    `,
    variables: {
      cartId: cartId,
      productId: randomProduct.id,
      quantity: 1,
    },
  });

  const addItemRes = http.post(API_URL, addItemMutation, { headers: HEADERS });
  check(addItemRes, {
    'addItem: status was 200': (r) => r.status === 200,
    'addItem: item was added': (r) => {
      const body = JSON.parse(r.body);
      return body.data.addItem.items.length > 0;
    },
  });

  sleep(2); // Pausa de 2 segundos
}
