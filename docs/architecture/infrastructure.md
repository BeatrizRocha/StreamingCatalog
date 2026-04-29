# Minha Infraestrutura em Nuvem (Cloud Architecture) ☁️

Neste documento, eu descrevo como escolhi e configurei o ecossistema que sustenta o **StreamingCatalog**. Priorizei serviços serverless e modernos que permitem escalabilidade com custo zero para este estágio do projeto.

## Meus Provedores e Serviços

| Componente | Provedor | Escolha Técnica |
| :--- | :--- | :--- |
| **Backend (API)** | [Render](https://render.com) | Escolhi por hospedar containers Docker de forma transparente. |
| **Frontend** | [Vercel](https://vercel.com) | Utilizo para o deployment instantâneo do React via GitHub. |
| **Banco de Dados** | [Neon](https://neon.tech) | Escolhi pelo suporte a PostgreSQL serverless com escalonamento automático. |
| **Cache & Redis** | [Upstash](https://upstash.com) | Utilizo pela resiliência e latência mínima em ambientes de borda. |

---

## Estratégia de CI/CD que Implementei

Eu configurei o **GitHub Actions** para ser o meu garantidor de qualidade. Todo commit que eu faço passa por um pipeline rigoroso:

- **Meu Fluxo Automático**:
    1. **Lint e Build**: Eu verifico se o código segue meus padrões e se compila sem erros.
    2. **Testes de Unidade**: Valido minhas regras de negócio isoladamente.
    3. **Testes E2E**: Eu subo um banco PostgreSQL temporário dentro do pipeline para testar o sistema como se estivesse em produção.
    4. **Auto-Deploy**: Se todos os testes passarem, eu autorizo o deploy automático na `main`.

---

## Como eu Gerencio a Segurança

Eu nunca armazeno chaves sensíveis no meu código. Gerencio tudo através de segredos de ambiente:
- **Segurança no CI/CD**: Utilizo **GitHub Secrets**.
- **Segurança em Produção**: Configurei as variáveis diretamente nos painéis de controle dos provedores (Render/Neon).

### Minhas Variáveis Críticas:
- `DATABASE_URL`: Minha conexão segura com o Neon.
- `REDIS_URL`: Minha ponte para o cache no Upstash.
- `TMDB_ACCESS_TOKEN`: Minha chave privada para o catálogo externo.

---

## Observações de Performance (Plano Gratuito)
Como estou utilizando os níveis gratuitos:
- **Cold Start**: Notei que a API no Render entra em repouso após 15 minutos sem uso. Eu compensei isso estruturando o sistema para ser o mais leve possível no boot.
- **Neon Autoscaling**: O banco também escala para zero quando eu não estou trabalhando, o que preserva os meus recursos.
