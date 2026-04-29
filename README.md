# StreamingCatalog 🎬

[![Production API](https://img.shields.io/badge/API-Live-brightgreen)](https://streaming-catalog-api-jfjb.onrender.com/api/docs)
![License](https://img.shields.io/badge/License-MIT-blue)

Interface para gerenciamento e descoberta de conteúdo audiovisual. Este projeto foi estruturado para demonstrar a aplicação de padrões de **BFF (Backend For Frontend)** e resiliência em sistemas distribuídos.

## 🏗️ Racional Arquitetural

### Por que NestJS e MVC?
Optei pelo **NestJS** por sua arquitetura modular e suporte nativo a injeção de dependência. Isso permite que cada módulo (`Auth`, `Tmdb`, `UserContent`) seja desenvolvido e testado isoladamente, seguindo os princípios de responsabilidade única. O padrão **MVC** no backend padroniza a entrada de dados e a comunicação com a camada de serviço, facilitando a escalabilidade.

### Por que Monorepo?
O projeto utiliza uma estrutura de monorepo para garantir a consistência entre o contrato da API e o consumo no Frontend. Isso facilita o compartilhamento de tipos e DTOs, reduzindo erros de dessincronização durante o desenvolvimento.

### Por que BFF (Backend For Frontend)?
A `catalog-api` atua como um proxy para o TMDb. Essa escolha foi feita para:
1. **Segurança**: Manter chaves de API ocultas do cliente.
2. **Performance**: Implementar camadas de cache centralizadas via Redis.
3. **Resiliência**: Tratar falhas de serviços externos sem comprometer a experiência do usuário.

## 📂 Documentação Técnica
- [Infraestrutura e Pipeline CI/CD](docs/architecture/infrastructure.md)
- [Estratégia de Autenticação e Segurança](docs/architecture/auth.md)
- [Integração TMDb e Resiliência de Cache](docs/architecture/tmdb_integration.md)
- [Persistência de Dados e Modelagem](docs/architecture/database.md)

---

## 🚀 Guia de Setup

### Pré-requisitos
- Node.js (v20+)
- Docker

### Execução em Desenvolvimento
1.  **Instalação**: `npm install` na raiz.
2.  **Variáveis**: Copie os arquivos `.env.example` para `.env` no diretório `catalog-api`.
3.  **Infraestrutura**: `docker-compose up -d` para subir PostgreSQL e Redis.
4.  **Backend**: 
    ```bash
    cd catalog-api
    npx prisma db push
    npm run start:dev
    ```

---

## 🧪 Estratégia de Testes
O projeto segue a pirâmide de testes para garantir a cobertura das regras de negócio e caminhos críticos:

- **Unitários**: Focados na lógica de serviços e validadores.
- **E2E (End-to-End)**: Validam o fluxo completo da API utilizando um banco de dados PostgreSQL isolado para garantir que o ambiente de dev não seja afetado.

```bash
# Executar todos os testes
cd catalog-api
npm run test      # Unitários
npm run test:e2e  # E2E
```