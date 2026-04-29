# Minha Arquitetura de Autenticação e Segurança (Auth Flow)

## Visão Geral
Eu projetei o sistema de autenticação utilizando JSON Web Token (JWT) seguindo o padrão **stateless**. Escolhi esse caminho para que a aplicação pudesse escalar sem depender de sessões armazenadas do lado do servidor.

## Minhas Escolhas Técnicas
- **Passport.js**: Utilizei como o middleware padrão para gerenciar minhas estratégias de autenticação no NestJS.
- **Bcrypt**: Apliquei para o hashing de senhas com um fator de salt de 10, garantindo segurança contra ataques de força bruta.
- **JWT**: Emiti tokens assinados com o algoritmo `HS256`.

## Fluxo que Implementei

### 1. Registro (`POST /auth/register`)
- Eu valido se o email já existe para evitar duplicatas.
- Hasheio a senha de forma segura antes de persistir no PostgreSQL.
- Retorno apenas os dados públicos do usuário.

### 2. Login e Emissão de Token (`POST /auth/login`)
- Eu valido as credenciais e, se corretas, emito um JWT com validade de **1 dia**.

### 3. Minha Camada de Segurança (Rate Limiting)
- Eu adicionei o `@nestjs/throttler` para proteger meus endpoints. 
- Implementei um limite global de **10 requisições por minuto** por IP, mitigando ataques de DoS e tentativas de login maliciosas.

### 4. DX Refinement: `@CurrentUser()`
- Para facilitar o desenvolvimento e manter as rotas limpas, eu criei um decorator customizado.
- Ele me permite extrair o ID do usuário (ou o objeto completo) de forma tipada diretamente nos parâmetros do controller, sem precisar manipular o objeto `Request` manualmente.

## Estratégia de Testes e Isolamento
- **Unitários**: Eu validei toda a lógica de hash e emissão isolando as dependências com mocks.
- **E2E**: Criei testes de ponta a ponta que validam o fluxo completo de registro e login.
- **Banco de Dados de Teste**: Eu configuro um banco dedicado (`streaming_catalog_test`) que é criado e destruído automaticamente. Isso garante que meu banco de desenvolvimento permaneça intacto durante os meus testes.
