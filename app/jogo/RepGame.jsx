"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./Styles/StyleRepGame.css";
import Tabuleiro from "./Tabuleiro";
import TelaInicial from "./TelaInicial";

const LIMITES = { minX: 3, maxX: 47, minY: 10, maxY: 47 };
const OBSTACLE_COUNT = 160;
const CASTLE_TILES = [
  [4, 24],
  [4, 25],
  [3, 24],
  [3, 25],
];
const coordKey = (x, y) => `${x}-${y}`;
const CASTLE_TILE_KEYS = new Set(
  CASTLE_TILES.map(([x, y]) => coordKey(x, y))
);
const MOVIMENTOS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};
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
  Array.from({ length: OBSTACLE_COUNT }, () => [
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

const PARTICLES = Array.from({ length: 12 }, (_, index) => index);

const gerarPosicaoLivre = (ocupadas = [], obstaculos = []) => {
  const ocupadasSet = new Set(ocupadas.map(([x, y]) => coordKey(x, y)));
  const obstaculosSet = new Set(obstaculos.map(([x, y]) => coordKey(x, y)));
  let ultimaTentativa = [LIMITES.minX, LIMITES.minY];

  for (let tentativas = 0; tentativas < 500; tentativas++) {
    const posicao = [
      numeroAleatorio(15, 47),
      numeroAleatorio(12, 47),
    ];
    const chave = coordKey(posicao[0], posicao[1]);
    const tileCastelo = CASTLE_TILE_KEYS.has(chave);

    if (!ocupadasSet.has(chave) && !obstaculosSet.has(chave) && !tileCastelo) {
      return posicao;
    }

    ultimaTentativa = posicao;
  }

  for (let x = LIMITES.minX; x <= LIMITES.maxX; x++) {
    for (let y = LIMITES.minY; y <= LIMITES.maxY; y++) {
      const chave = coordKey(x, y);
      if (!ocupadasSet.has(chave) && !obstaculosSet.has(chave)) {
        return [x, y];
      }
    }
  }

  return ultimaTentativa;
};

const expandirCorredor = (corredor, largura = 1) => {
  const faixa = new Set();

  corredor.forEach(([x, y]) => {
    for (let dx = -largura; dx <= largura; dx++) {
      for (let dy = -largura; dy <= largura; dy++) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx >= LIMITES.minX &&
          nx <= LIMITES.maxX &&
          ny >= LIMITES.minY &&
          ny <= LIMITES.maxY
        ) {
          faixa.add(`${nx}-${ny}`);
        }
      }
    }
  });

  return faixa;
};

const criarCorredor = (inicio, fim) => {
  const corredor = [];
  if (!inicio || !fim) {
    return corredor;
  }

  let [xAtual, yAtual] = inicio;
  const [xDestino, yDestino] = fim;

  while (xAtual !== xDestino) {
    corredor.push([xAtual, yAtual]);
    xAtual += Math.sign(xDestino - xAtual);
  }

  while (yAtual !== yDestino) {
    corredor.push([xAtual, yAtual]);
    yAtual += Math.sign(yDestino - yAtual);
  }

  corredor.push([xDestino, yDestino]);
  return corredor;
};

const removerObstaculosEmFaixas = (obstaculos, faixas) => {
  if (!faixas.length) {
    return obstaculos;
  }

  const faixaSet = new Set();
  faixas.forEach((faixa) => {
    faixa.forEach((chave) => faixaSet.add(chave));
  });

  return obstaculos.filter(([x, y]) => !faixaSet.has(`${x}-${y}`));
};

const lapidarObstaculosParaFluxo = (obstaculos, jogador, objetivo) => {
  if (!jogador || jogador.length !== 2) {
    return obstaculos;
  }

  const faixas = [expandirCorredor([jogador], 2)];

  if (objetivo && objetivo.length === 2) {
    faixas.push(expandirCorredor(criarCorredor(jogador, objetivo), 1));
    faixas.push(expandirCorredor(criarCorredor(objetivo, CASTLE_TILES[0]), 2));
  }

  return removerObstaculosEmFaixas(obstaculos, faixas);
};

const criarNovoCenario = () => {
  const obstaculosIniciais = gerarObstaculos();
  const terrenosIniciais = gerarTerrenos();
  const objetivoInicial = gerarPosicaoLivre([], obstaculosIniciais);
  const jogadorInicial = gerarPosicaoLivre(
    [objetivoInicial],
    obstaculosIniciais
  );

  const obstaculosLapidados = lapidarObstaculosParaFluxo(
    obstaculosIniciais,
    jogadorInicial,
    objetivoInicial
  );

  return {
    obstaculos: obstaculosLapidados,
    terrenos: terrenosIniciais,
    objetivo: objetivoInicial,
    jogador: jogadorInicial,
  };
};

export default function RepGame() {
  const setupRef = useRef(null);

  if (!setupRef.current) {
    setupRef.current = criarNovoCenario();
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

  const obstaculosKeySet = useMemo(
    () => new Set(obst.map(([x, y]) => coordKey(x, y))),
    [obst]
  );

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

  const statusHighlightClass = useMemo(() => {
    if (objetivoEncontrado) {
      return "status-panel__message--success";
    }
    if (progressoObjetivo >= 70) {
      return "status-panel__message--near";
    }
    if (progressoObjetivo <= 25) {
      return "status-panel__message--calm";
    }
    return "";
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

  const avaliarMovimento = useCallback(
    (posicaoAtual, delta) => {
      const proximaPosicao = [
        posicaoAtual[0] + delta[0],
        posicaoAtual[1] + delta[1],
      ];
      const proximaChave = coordKey(
        proximaPosicao[0],
        proximaPosicao[1]
      );

      if (
        proximaPosicao[0] < LIMITES.minX ||
        proximaPosicao[0] > LIMITES.maxX ||
        proximaPosicao[1] < LIMITES.minY ||
        proximaPosicao[1] > LIMITES.maxY
      ) {
        return {
          proximaPosicao: posicaoAtual,
          warning: "As árvores fecham o caminho por aqui.",
        };
      }

      if (obstaculosKeySet.has(proximaChave)) {
        return {
          proximaPosicao: posicaoAtual,
          warning: "Algo bloqueia o caminho!",
        };
      }

      const tileCastelo = CASTLE_TILE_KEYS.has(proximaChave);

      if (!objetivoEncontrado && tileCastelo) {
        return {
          proximaPosicao: posicaoAtual,
          warning: "Encontre a Excalibur antes de entrar no castelo!",
          status:
            "Continue explorando a floresta para achar a espada lendária.",
        };
      }

      const encontrouObjetivo =
        objetivo[0] != null &&
        objetivo[1] != null &&
        proximaPosicao[0] === objetivo[0] &&
        proximaPosicao[1] === objetivo[1];

      return {
        proximaPosicao,
        encontrouObjetivo,
        entrouNoCastelo: objetivoEncontrado && tileCastelo,
      };
    },
    [objetivoEncontrado, objetivo, obstaculosKeySet]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (tela || !personagemCastelo) {
        return;
      }

      const delta = MOVIMENTOS[event.key];

      if (!delta) {
        return;
      }

      event.preventDefault();

      setPlayer((posicaoAtual) => {
        const resultado = avaliarMovimento(posicaoAtual, delta);

        if (resultado.warning) {
          setWarningMessage(resultado.warning);
          if (resultado.status) {
            setStatusMessage(resultado.status);
          }
          return posicaoAtual;
        }

        setWarningMessage("");
        setMover((prev) => prev + 1);

        if (resultado.encontrouObjetivo) {
          setObjetivoEncontrado(true);
          setObjetivo([null, null]);
          setStatusMessage("Você encontrou a Excalibur! Retorne ao castelo.");
        }

        if (resultado.entrouNoCastelo) {
          setPersonagemCastelo(false);
          setStatusMessage("Missão cumprida! Stuart chegou ao castelo.");
        }

        return resultado.proximaPosicao ?? posicaoAtual;
      });
    },
    [tela, personagemCastelo, avaliarMovimento]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const reiniciarJogo = useCallback(() => {
    const novoCenario = criarNovoCenario();

    setObst(novoCenario.obstaculos);
    setLamaCapim(novoCenario.terrenos);
    setObjetivo(novoCenario.objetivo);
    setPlayer(novoCenario.jogador);
    setPersonagemCastelo(true);
    setObjetivoEncontrado(false);
    setMover(0);
    setStatusMessage("Use as setas do teclado para explorar a floresta.");
    setWarningMessage("");
    setupRef.current = novoCenario;
  }, []);

  const iniciarAventura = useCallback(() => {
    reiniciarJogo();
    setTela(false);
  }, [reiniciarJogo]);

  return (
    <div className="game">
      <div className="game__layer" aria-hidden="true">
        <div className="game__aurora" />
        <div className="game__particles">
          {PARTICLES.map((particle) => (
            <span
              key={particle}
              className={`game__particle game__particle--${(particle % 6) + 1}`}
            />
          ))}
        </div>
      </div>
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
              <p className={`status-panel__message ${statusHighlightClass}`}>
                {statusMessage}
              </p>
              {warningMessage && (
                <p className="status-panel__warning" aria-live="assertive">
                  {warningMessage}
                </p>
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
