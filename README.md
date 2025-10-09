# Stuart e o Castelo Perdido

Uma aventura em React/Next.js onde o jogador precisa encontrar a Excalibur e escapar do labirinto até alcançar o castelo. O projeto roda em Next.js 15 com componentes client-side para o tabuleiro do jogo.

## Requisitos
- Node.js 18+

## Scripts disponíveis
- `npm run dev` inicia o servidor de desenvolvimento.
- `npm run build` gera o build de produção.
- `npm run start` executa o build de produção.
- `npm run lint` roda o linting com ESLint.

## Como jogar
1. Inicie o modo desenvolvimento com `npm run dev`.
2. Acesse `http://localhost:3000` para entrar diretamente no tabuleiro.
3. Use as setas do teclado para mover Stuart pelo labirinto.
4. Colete a Excalibur brilhante e, em seguida, retorne ao castelo para vencer a partida.
5. Ao concluir a missão, pressione **Enter** ou clique em **Jogar novamente** para reiniciar.

### Verificando rapidamente
- `npm run build` garante que o bundle de produção continua saudável.
- `npm run dev -- --hostname 0.0.0.0 --port 3000` permite inspecionar a prévia em um navegador apontando para `http://localhost:3000`.

## Estrutura principal
- `app/jogo/TelaPrincipal.jsx`: controla o fluxo entre a tela inicial e o jogo.
- `app/jogo/RepGame.jsx`: gerencia a lógica do jogo e o estado do jogador.
- `app/jogo/Tabuleiro.jsx`: renderiza a porção visível do labirinto.
- `app/jogo/Styles/`: contém os estilos CSS utilizados nas telas.

## Próximos passos sugeridos
Consulte `CODE_REVIEW.md` para uma lista de melhorias potenciais identificadas durante a revisão anterior.
