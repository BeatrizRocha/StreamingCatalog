# Autenticação e Segurança: Fluxo e Racional

## Racional do Modelo Stateless (JWT)
A escolha por **JWT (JSON Web Token)** em um modelo stateless visa a escalabilidade horizontal. Ao não armazenar sessões no servidor ou em banco de dados, o backend permanece independente de estado, facilitando o balanceamento de carga.

## Componentes do Fluxo
1.  **Hasing (Bcrypt)**: As senhas são processadas com um fator de salt de 10. Esta escolha equilibra segurança contra ataques de dicionário e custo computacional.
2.  **Passport.js**: Utilizado como abstração para a estratégia JWT, permitindo que a lógica de autorização seja removida dos controllers e tratada via decorators e guards.
3.  **Decoração Customizada (`@CurrentUser`)**: Desenvolvida para abstrair a extração do payload do token de dentro do objeto `Request`. Isso garante tipagem forte e evita o uso de `any` ou casting manual no nível do controller.

## Camada de Proteção (Rate Limiting)
Implementei o `@nestjs/throttler` como uma medida de segurança ativa para:
- Mitigar ataques de força bruta no login.
- Prevenir abusos de consumo na integração com o TMDb.
- **Configuração**: 10 requisições por minuto com bypass específico para o monitoramento de saúde (Health Check) do Render.

## Validação de Testes
A estratégia de testes para este módulo foca na integridade do payload e na expiração do token. Os testes E2E garantem que o fluxo `Registro -> Login -> Acesso Protegido` funcione sem falhas inesperadas de integração.
