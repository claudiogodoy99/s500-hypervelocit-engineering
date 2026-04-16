# Desafio Jogo da Velha — S500

## Objetivo

Dois grupos do time S500 devem se dividir (frontend e backend) e construir juntos um **jogo da velha online local**: duas abas do navegador na mesma máquina, jogando uma contra a outra em tempo real.

## Regras do Desafio

- O jogo roda **localmente** (localhost) — não será publicado.
- O foco é a **definição e respeito aos contratos** entre frontend e backend.
- Cada grupo é dono da sua camada e deve se comunicar apenas via contrato acordado.

## Estrutura

```
backend/   → API e lógica do jogo
frontend/  → Interface do tabuleiro e interação do jogador
```

## Fluxo Básico

1. Jogador 1 abre o app e cria uma partida.
2. Jogador 2 abre outra aba e entra na mesma partida (via `gameId`).
3. Jogam alternadamente até alguém vencer ou empatar.

## O que importa

- Contrato claro entre as camadas.
- Comunicação entre os grupos.
- Código funcional rodando local.