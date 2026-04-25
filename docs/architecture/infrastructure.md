# Arquitetura de Infraestrutura em Nuvem (Cloud Architecture) ☁️

Este documento descreve o ecossistema de infraestrutura que sustenta o **StreamingCatalog**.

## Provedores e Serviços

| Componente | Provedor | Plano | Descrição |
| :--- | :--- | :--- | :--- |
| **Backend (API)** | [Render](https://render.com) | Free | Container Docker rodando o NestJS. |
| **Frontend** | [Vercel](https://vercel.com) | Hobby | React/Vite com deployment automático. |
| **Banco de Dados** | [Neon](https://neon.tech) | Free | PostgreSQL 17 com Connection Pooling. |
| **Cache & Redis** | [Upstash](https://upstash.com) | Free | Redis Serverless para cache do TMDb. |

---

## Estratégia de CI/CD (GitHub Actions)

O pipeline de Integração Contínua (CI) é disparado em todo commit e Pull Request.

- **Fluxo**:
    1.  **Lint e Build**: Garante que o código compila e segue as regras de estilo.
    2.  **Testes de Unidade**: Valida as regras de negócio de forma isolada.
    3.  **Testes E2E**: Sobe um container Postgres efêmero no GitHub e testa o fluxo completo de API.
- **Continuous Deployment**: Apenas commits na branch `main` são implantados automaticamente nos provedores de nuvem.

---

## Gerenciamento de Credenciais (Segurança)

As chaves sensíveis nunca são armazenadas no repositório:
- **CI/CD**: Utiliza **GitHub Secrets**.
- **Produção**: As variáveis são configuradas diretamente nos painéis do Render e Vercel.

Principais chaves utilizadas:
- `DATABASE_URL`: Conexão com o Neon.
- `REDIS_URL`: Conexão com o Upstash.
- `JWT_SECRET`: Chave para assinatura de tokens.

---

## Considerações de Ambiente Gratuito
- **Render Cold Start**: A API entra em repouso após 15 minutos de inatividade. A primeira requisição após esse período pode demorar até 40s para ser respondida.
- **Neon Autoscaling**: O banco escala a zero quando não está em uso, preservando recursos.
