# Minha Integração TMDb & Estratégia de Cache (BFF)

Neste documento, eu detalho como construí a camada de integração com a API do TMDb e as decisões que tomei para garantir performance e economia de recursos.

## 1. Minha Visão de BFF (Backend For Frontend)

Eu decidi que o Frontend nunca deveria consumir o TMDb diretamente. Em vez disso, transformei minha `catalog-api` em um **Proxy Inteligente**. 

### Por que fiz isso?
- **Segurança de Segredos:** Eu mantenho meu `TMDB_ACCESS_TOKEN` protegido no servidor, longe do navegador do usuário.
- **Economia de Cota:** Ao centralizar as chamadas, eu consegui implementar uma camada de cache que reduz agressivamente o consumo da API externa.
- **Resiliência:** Se o TMDb estiver lento ou instável, eu consigo gerenciar os timeouts e erros de forma amigável para o meu frontend.

## 2. Minha Estratégia de Caching e Performance

Eu utilizei o **Redis (Upstash)** para armazenar as respostas do TMDb. No entanto, eu não apenas "salvo os dados"; eu projetei um sistema de **Graceful Degradation** dentro do meu `TmdbService`.

### Como o meu Cache funciona:
1. **Busca Inteligente**: Eu tento recuperar os dados do Redis primeiro.
2. **Fallback Automático**: Se o Redis falhar por qualquer motivo (latência ou queda), eu capturei o erro e fiz o sistema buscar os dados diretamente da API original. O usuário nunca percebe que o cache falhou.
3. **Constantes Centralizadas**: Eu eliminei "magic numbers". Todos os tempos de vida (TTL) são gerenciados centralmente em `src/common/constants/cache.constants.ts`.

### Meus Tempos de Cache:
| Recurso | TTL | Justificativa |
| :--- | :--- | :--- |
| Trending | 12 Horas | Filmes populares mudam pouco ao longo do dia. |
| Search | 5 Minutos | Evito que pesquisas idênticas sobrecarreguem o sistema. |
| Details | 24 Horas | Dados técnicos de filmes são estáticos. |

## 3. Minha Suite de Testes E2E

Para garantir que minha integração nunca quebre, eu criei testes que:
1. **Simulam o TMDb**: Eu faço um override no `HttpService` para não gastar minha cota durante os testes.
2. **Simulam o Redis**: Eu substituo o Redis real por um `Map` em memória durante a execução dos testes E2E, garantindo velocidade e independência de infraestrutura externa.
