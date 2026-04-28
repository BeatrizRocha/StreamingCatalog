# Integração TMDb & Estratégia de Cache (BFF)

Este documento detalha a arquitetura da camada de integração com a The Movie Database (TMDb) e a estratégia de caching adotada no **StreamingCatalog**.

## 1. Arquitetura BFF (Backend For Frontend)

Ao invés do Frontend em React consumir a API do TMDb diretamente (o que exporia meu `ACCESS_TOKEN` no navegador do usuário e esgotaria minha cota de API rapidamente), a minha `catalog-api` (NestJS) atua como um **Proxy Inteligente**.

O Frontend faz as requisições para os meus endpoints protegidos, e eu repasso para o TMDb de forma segura utilizando o `@nestjs/axios`.

### Benefícios:
- **Segurança Oculta:** O `TMDB_ACCESS_TOKEN` vive exclusivamente no cofre do backend (GitHub Secrets / Render Auth).
- **Controle de Rate Limit:** Reduzi drasticamente as chamadas externas, mitigando riscos de bloqueio da minha conta no TMDb.
- **Padronização:** Erros oriundos do TMDb são interceptados pelo meu `HttpExceptionFilter` e formatados no padrão esperado pelo Frontend.

---

## 2. Estratégia de Caching (Upstash Redis)

O uso de Cache é vital. Rotas como "Filmes Populares" (Trending) retornam a mesma lista o dia inteiro. Buscar isso na internet a cada clique de usuário derrubaria a performance do sistema.

Utilizei o `@nestjs/cache-manager` impulsionado pelo adaptador `@keyv/redis` para me comunicar com o meu banco Serverless **Upstash Redis**.

### Tabelas de TTL (Time To Live)

Para maximizar a eficiência, diferentes rotas possuem tempos de expiração variados utilizando o decorator `@CacheTTL()` na camada do `TmdbController`:

| Rota BFF | TTL (Tempo de Vida) | Justificativa |
| :--- | :--- | :--- |
| `GET /tmdb/trending` | **12 Horas** | A lista de "Filmes Populares do dia" do TMDb não muda bruscamente. Manter em cache economiza milhares de requisições por dia. |
| `GET /tmdb/search` | **5 Minutos** | Buscas tendem a ser efêmeras, mas usuários costumam digitar as mesmas coisas ("avatar", "matrix"). O micro-cache evita picos de pesquisa. |
| `GET /tmdb/details/:type/:id`| **24 Horas** | Filmes clássicos e dados de elenco não mudam. Manter em cache alto garante carregamento instantâneo da tela de "Detalhes". |

> **Nota Técnica de Implementação:** Optei por amarrar a persistência do Redis no nível de **Interceptor** (`@UseInterceptors(CacheInterceptor)`) diretamente nas Rotas (`Controllers`), permitindo que as chaves de busca e queries sejam automaticamente mapeadas pela engine do NestJS, retirando a complexidade de chaveamento manual de dentro do Service.

---

## 3. Estratégia de Isolamento de Testes E2E

Para garantir a confiabilidade dos testes automatizados e o verde constante das esteiras CI/CD (GitHub Actions), toda a camada do TMDb foi isolada no arquivo `tmdb.e2e-spec.ts`.

Nessas execuções, o sistema:
1. Sofre um *Override* no `HttpService` injetando Respostas Vazias (Evitando bater de verdade no TMDb).
2. Sofre um *Override* global no `JwtAuthGuard` (Evitando inserir um banco de dados gigantesco apenas para forjar um token de acesso).
3. Sofre um *Override* inteligente no `CACHE_MANAGER` utilizando um objeto nativo do JavaScript (`new Map()`), permitindo testar se o mecanismo de interceptação de Cache funciona, mas sem depender localmente de um contêiner Docker rodando o Redis na porta `6380`.
