# Catálogo Externo: Integração e Resiliência

## Design do BFF (Proxy)
A integração com o TMDb não ocorre diretamente via Frontend para garantir a segurança dos segredos e permitir o controle de tráfego.

## Estratégia de Cache e Fallback
O sistema utiliza **Upstash Redis** para minimizar a latência e o consumo de quota. 

### Racional do Graceful Degradation
A implementação no `TmdbService` foi projetada para ser tolerante a falhas de infraestrutura:
1.  **Tentativa de Cache**: O sistema tenta ler do Redis.
2.  **Fallback Transparente**: Caso o Redis esteja indisponível (timeout ou conexão recusada), um bloco `try-catch` intercepta a falha e redireciona a busca para a API externa.
3.  **Resultado**: A aplicação permanece funcional mesmo com degradação parcial do ecossistema de dados.

### Gestão de Constantes
Os TTLs (Time To Live) foram centralizados (`cache.constants.ts`) para facilitar ajustes de performance baseados em telemetria, evitando que valores arbitrários sejam espalhados pelo código.

## Isolamento de Testes
Nos testes E2E, utilizo o recurso de **Overriding Providers** do NestJS para:
- Mockar o `HttpService` e evitar chamadas reais à rede.
- Substituir o Redis por um storage em memória (`Map`), garantindo que os testes sejam determinísticos e independentes de serviços externos.
