"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./Styles/StyleRepGame.css";
import Tabuleiro from "./Tabuleiro";
import TelaInicial from "./TelaInicial";

const LIMITES = { minX: 3, maxX: 47, minY: 10, maxY: 47 };
const CASTLE_TILES = [
  [4, 24],
  [4, 25],
  [3, 24],
  [3, 25],
];
const MAX_DISTANCE = Math.hypot(
  LIMITES.maxX - LIMITES.minX,
  LIMITES.maxY - LIMITES.minY
);

const numeroAleatorio = (min, max) => {
  const inteiroMin = Math.ceil(min);
  const inteiroMax = Math.floor(max);
  return Math.floor(Math.random() * (inteiroMax - inteiroMin + 1)) + inteiroMin;
};

const gerarObstaculos = () =>
  Array.from({ length: 200 }, () => [
    numeroAleatorio(15, 47),
    numeroAleatorio(10, 47),
    numeroAleatorio(1, 2),
  ]);

const gerarTerrenos = () =>
  Array.from({ length: 50 }, () => [
    numeroAleatorio(15, 47),
    numeroAleatorio(10, 47),
    numeroAleatorio(1, 2),
  ]);

const gerarPosicaoLivre = (ocupadas = [], obstaculos = []) => {
  const ocupadasSet = new Set(ocupadas.map(([x, y]) => `${x}-${y}`));
  const obstaculosSet = new Set(obstaculos.map(([x, y]) => `${x}-${y}`));
  let ultimaTentativa = [LIMITES.minX, LIMITES.minY];

  for (let tentativas = 0; tentativas < 500; tentativas++) {
    const posicao = [
      numeroAleatorio(15, 47),
      numeroAleatorio(12, 47),
    ];
    const chave = `${posicao[0]}-${posicao[1]}`;
    const tileCastelo = CASTLE_TILES.some(
      ([x, y]) => x === posicao[0] && y === posicao[1]
    );

    if (!ocupadasSet.has(chave) && !obstaculosSet.has(chave) && !tileCastelo) {
      return posicao;
    }

    ultimaTentativa = posicao;
  }

  return ultimaTentativa;
};

export default function RepGame() {
  const setupRef = useRef(null);

  if (!setupRef.current) {
    const obstaculosIniciais = gerarObstaculos();
    const terrenosIniciais = gerarTerrenos();
    const objetivoInicial = gerarPosicaoLivre([], obstaculosIniciais);
    const jogadorInicial = gerarPosicaoLivre(
      [objetivoInicial],
      obstaculosIniciais
    );

    setupRef.current = {
      obstaculos: obstaculosIniciais,
      terrenos: terrenosIniciais,
      objetivo: objetivoInicial,
      jogador: jogadorInicial,
    };
  }

  const [obst, setObst] = useState(setupRef.current.obstaculos);
  const [lamaCapim, setLamaCapim] = useState(setupRef.current.terrenos);
  const [player, setPlayer] = useState(setupRef.current.jogador);
  const [objetivo, setObjetivo] = useState(setupRef.current.objetivo);
  const [mover, setMover] = useState(0);
  const [objetivoEncontrado, setObjetivoEncontrado] = useState(false);
  const [tela, setTela] = useState(true);
  const [personagemCastelo, setPersonagemCastelo] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    "Use as setas do teclado para explorar a floresta."
  );
  const [warningMessage, setWarningMessage] = useState("");

  const distanciaObjetivo = useMemo(() => {
    if (
      objetivoEncontrado ||
      objetivo[0] == null ||
      objetivo[1] == null ||
      player[0] == null ||
      player[1] == null
    ) {
      return 0;
    }

    return Math.hypot(player[0] - objetivo[0], player[1] - objetivo[1]);
  }, [objetivoEncontrado, objetivo, player]);

  const progressoObjetivo = useMemo(() => {
    if (objetivoEncontrado) {
      return 100;
    }

    const progresso =
      ((MAX_DISTANCE - Math.min(distanciaObjetivo, MAX_DISTANCE)) /
        MAX_DISTANCE) *
      100;

    return Math.max(0, Math.min(100, Math.round(progresso)));
  }, [distanciaObjetivo, objetivoEncontrado]);

  const progressoDescricao = useMemo(() => {
    if (objetivoEncontrado) {
      return "Corra para o castelo!";
    }
    if (progressoObjetivo > 80) {
      return "Você sente a Excalibur muito perto.";
    }
    if (progressoObjetivo > 55) {
      return "Pegadas frescas indicam que o objetivo está próximo.";
    }
    if (progressoObjetivo > 30) {
      return "Continue avançando, o brilho começa a aparecer.";
    }
    return "O castelo está distante, explore com calma.";
  }, [objetivoEncontrado, progressoObjetivo]);

  useEffect(() => {
    if (!warningMessage) {
      return;
    }

    const timeout = setTimeout(() => setWarningMessage(""), 1800);
    return () => clearTimeout(timeout);
  }, [warningMessage]);

  useEffect(() => {
    if (!tela && objetivoEncontrado) {
      setStatusMessage("Você encontrou a Excalibur! Retorne ao castelo.");
    }
  }, [objetivoEncontrado, tela]);

  const handleKeyDown = useCallback(
    (event) => {
      if (tela || !personagemCastelo) {
        return;
      }

      const movimentos = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const delta = movimentos[event.key];

      if (!delta) {
        return;
      }

      event.preventDefault();

      setPlayer((posicaoAtual) => {
        const proximaPosicao = [
          posicaoAtual[0] + delta[0],
          posicaoAtual[1] + delta[1],
        ];

        const foraDoMapa =
          proximaPosicao[0] < LIMITES.minX ||
          proximaPosicao[0] > LIMITES.maxX ||
          proximaPosicao[1] < LIMITES.minY ||
          proximaPosicao[1] > LIMITES.maxY;

        if (foraDoMapa) {
          setWarningMessage("As árvores fecham o caminho por aqui.");
          return posicaoAtual;
        }

        const temObstaculo = obst.some(
          ([x, y]) => x === proximaPosicao[0] && y === proximaPosicao[1]
        );

        if (temObstaculo) {
          setWarningMessage("Algo bloqueia o caminho!");
          return posicaoAtual;
        }

        const tileCastelo = CASTLE_TILES.some(
          ([x, y]) => x === proximaPosicao[0] && y === proximaPosicao[1]
        );

        if (!objetivoEncontrado && tileCastelo) {
          setWarningMessage(
            "Encontre a Excalibur antes de entrar no castelo!"
          );
          setStatusMessage(
            "Continue explorando a floresta para achar a espada lendária."
          );
          return posicaoAtual;
        }

        if (
          posicaoAtual[0] === proximaPosicao[0] &&
          posicaoAtual[1] === proximaPosicao[1]
        ) {
          return posicaoAtual;
        }

        setWarningMessage("");
        setMover((prev) => prev + 1);

        if (
          objetivo[0] != null &&
          objetivo[1] != null &&
          proximaPosicao[0] === objetivo[0] &&
          proximaPosicao[1] === objetivo[1]
        ) {
          setObjetivoEncontrado(true);
          setObjetivo([null, null]);
          setStatusMessage("Você encontrou a Excalibur! Retorne ao castelo.");
        }

        if (objetivoEncontrado && tileCastelo) {
          setPersonagemCastelo(false);
          setStatusMessage("Missão cumprida! Stuart chegou ao castelo.");
        }

        return proximaPosicao;
      });
    },
    [tela, personagemCastelo, obst, objetivo, objetivoEncontrado]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const reiniciarJogo = useCallback(() => {
    const novosObstaculos = gerarObstaculos();
    const novoTerreno = gerarTerrenos();
    const novoObjetivo = gerarPosicaoLivre([], novosObstaculos);
    const novoJogador = gerarPosicaoLivre([novoObjetivo], novosObstaculos);

    setObst(novosObstaculos);
    setLamaCapim(novoTerreno);
    setObjetivo(novoObjetivo);
    setPlayer(novoJogador);
    setPersonagemCastelo(true);
    setObjetivoEncontrado(false);
    setMover(0);
    setStatusMessage("Use as setas para explorar e encontrar a Excalibur!");
    setWarningMessage("");
  }, []);

  const iniciarAventura = useCallback(() => {
    reiniciarJogo();
    setTela(false);
  }, [reiniciarJogo]);

  return (
    <div className="game">
      {!tela && (
        <>
          <div className="hud" role="status">
            <div className="hud__stat">
              <span className="hud__label">Movimentos</span>
              <span className="hud__value">{mover}</span>
            </div>
            <div className="hud__stat">
              <span className="hud__label">Objetivo</span>
              <span
                className={`hud__value ${
                  objetivoEncontrado ? "hud__value--success" : ""
                }`}
              >
                {objetivoEncontrado ? "Encontrado" : "Perdido"}
              </span>
            </div>
            <button className="hud__button" onClick={reiniciarJogo}>
              Reiniciar aventura
            </button>
          </div>

          <div className="game__content">
            <div className="board-wrapper">
              <Tabuleiro
                jogador={player}
                obj={objetivo}
                obst={obst}
                reiniciarJogo={reiniciarJogo}
                LamaCapim={lamaCapim}
              />
            </div>

            <aside className="status-panel">
              <h2 className="status-panel__title">Diário de bordo</h2>
              <p className="status-panel__message">{statusMessage}</p>
              {warningMessage && (
                <p className="status-panel__warning">{warningMessage}</p>
              )}
              <div className="progress" role="presentation">
                <span className="progress__label">Distância até o objetivo</span>
                <div className="progress__track" aria-hidden="true">
                  <div
                    className="progress__fill"
                    style={{ width: `${progressoObjetivo}%` }}
                  />
                </div>
                <span className="progress__hint">{progressoDescricao}</span>
              </div>
              <ul className="status-panel__tips">
                <li>Use as teclas direcionais para mover Stuart.</li>
                <li>Evite rios, lama e pedras para não recomeçar.</li>
                <li>Leve a Excalibur até o castelo para vencer.</li>
              </ul>
            </aside>
          </div>
        </>
      )}

      {tela && <TelaInicial iniciarJogo={iniciarAventura} />}

      {!tela && !personagemCastelo && (
        <div className="final" role="dialog" aria-live="assertive">
          <div className="final__content">
            <h1 className="final__title">Parabéns! Você chegou ao castelo.</h1>
            <p className="final__subtitle">
              Stuart está salvo graças ao seu caminho certeiro.
            </p>
            <button className="final__button" onClick={reiniciarJogo}>
              Jogar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
