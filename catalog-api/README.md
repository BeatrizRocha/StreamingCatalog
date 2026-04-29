# 🚀 catalog-api (Backend)

Este módulo implementa o **BFF (Backend For Frontend)** do projeto, responsável pela agregação de dados do TMDb, autenticação de usuários e persistência de preferências.

## 🛠️ Decisões Tecnológicas
- **Framework**: [NestJS](https://nestjs.com/) (Arquitetura modular e injeção de dependência).
- **ORM**: [Prisma 7](https://www.prisma.io/) (Tipagem forte e sincronização de esquema).
- **Segurança**: Throttler (limitação de taxa) e JWT (sessões stateless).

## 🗄️ Ciclo de Vida do Banco de Dados
Para evoluir o esquema:
```bash
npx prisma db push   # Sincroniza o schema.prisma com o banco
```

## 🧪 Estratégia de Testes
A qualidade é mantida através de testes unitários e de integração (E2E):
```bash
npm run test        # Validação de lógica isolada
npm run test:e2e    # Validação de fluxos de integração
```

## 🛡️ Notas de Segurança
A API implementa **Rate Limiting** global. Em caso de erro `429`, verifique se o limite de 10 requisições por minuto foi excedido. O endpoint raiz (`/`) está isento desta regra para permitir o monitoramento de saúde do provedor de nuvem.
