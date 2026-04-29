# 🚀 Minha API (catalog-api)

Este módulo é o coração do projeto. Eu o construí para servir como um **BFF (Backend For Frontend)** robusto, seguro e altamente performático.

## 🛠️ Tecnologias que Escolhi
- **Framework**: NestJS (para uma arquitetura modular e escalável).
- **ORM**: Prisma 7 (com PostgreSQL).
- **Segurança**: Passport JWT + Bcrypt + Rate Limiting.
- **Documentação**: Swagger / OpenAPI 3.0.

## 📖 Minha Documentação Interativa
Eu configurei o Swagger para que você possa testar todos os meus endpoints em tempo real:
- **Ambiente Local**: `http://localhost:3000/api/docs`
- **Link de Produção**: `https://streaming-catalog-api-jfjb.onrender.com/api/docs`

## 🗄️ Como eu Gerencio o Banco de Dados
Sempre que eu faço uma alteração estrutural no `schema.prisma`, eu sigo este fluxo:
```bash
npx prisma generate  # Eu atualizo meus tipos do TypeScript
npx prisma db push   # Eu sincronizo as alterações com o banco
```

## 🧪 Meus Comandos de Verificação
Eu mantenho o projeto saudável com estes scripts:
```bash
npm run start:dev   # Eu inicio o desenvolvimento local
npm run test        # Eu executo meus testes unitários
npm run test:e2e    # Eu valido o fluxo completo com banco isolado
```

## 🛡️ Camada de Segurança
Implementei um limite de requisições global. Se você receber um erro `429 (Too Many Requests)`, significa que excedeu o meu limite de segurança de 10 chamadas por minuto.
