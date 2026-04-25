# 🚀 StreamingCatalog API (Backend)

Este módulo é o coração do projeto, servindo como um **BFF (Backend For Frontend)** robusto e seguro.

## 🛠️ Tecnologias
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Autenticação**: Passport JWT + Bcrypt
- **Documentação**: Swagger / OpenAPI 3.0

## 📖 Documentação Interativa
Com a API rodando, acesse:
- **Local**: `http://localhost:3000/api/docs`
- **Produção**: `https://streaming-catalog-api-jfjb.onrender.com/api/docs`

## 🗄️ Banco de Dados (Prisma)
Sempre que alterar o `schema.prisma`, execute:
```bash
npx prisma generate  # Atualiza os tipos do TypeScript
npx prisma db push   # Sincroniza com o banco de dados
```

## 🧪 Comandos Principais
```bash
npm run start:dev   # Inicia em modo desenvolvimento
npm run test        # Roda testes unitários
npm run test:e2e    # Roda testes de ponta a ponta
```
