"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./Styles/StyleRepGame.css";
import Tabuleiro from "./Tabuleiro";

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
  const [objetivoEncontrado, setObjetivoEncontrado] = useState(false);
  const [personagemCastelo, setPersonagemCastelo] = useState(true);

  const obstaculosKeySet = useMemo(
    () => new Set(obst.map(([x, y]) => coordKey(x, y))),
    [obst]
  );

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
        return null;
      }

      if (obstaculosKeySet.has(proximaChave)) {
        return null;
      }

      const tileCastelo = CASTLE_TILE_KEYS.has(proximaChave);

      if (!objetivoEncontrado && tileCastelo) {
        return null;
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

  const reiniciarJogo = useCallback(() => {
    const novoCenario = criarNovoCenario();

    setObst(novoCenario.obstaculos);
    setLamaCapim(novoCenario.terrenos);
    setObjetivo(novoCenario.objetivo);
    setPlayer(novoCenario.jogador);
    setObjetivoEncontrado(false);
    setPersonagemCastelo(true);
    setupRef.current = novoCenario;
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (!personagemCastelo) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          reiniciarJogo();
        }
        return;
      }

      const delta = MOVIMENTOS[event.key];

      if (!delta) {
        return;
      }

      event.preventDefault();

      setPlayer((posicaoAtual) => {
        const resultado = avaliarMovimento(posicaoAtual, delta);

        if (!resultado) {
          return posicaoAtual;
        }

        if (resultado.encontrouObjetivo) {
          setObjetivoEncontrado(true);
          setObjetivo([null, null]);
        }

        if (resultado.entrouNoCastelo) {
          setPersonagemCastelo(false);
        }

        return resultado.proximaPosicao ?? posicaoAtual;
      });
    },
    [avaliarMovimento, personagemCastelo, reiniciarJogo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="game">
      <div className="game__stage">
        <Tabuleiro
          jogador={player}
          obj={objetivo}
          obst={obst}
          reiniciarJogo={reiniciarJogo}
          LamaCapim={lamaCapim}
        />
      </div>

      {!personagemCastelo && (
        <div className="game__overlay" role="dialog" aria-live="assertive">
          <div className="game__overlay-card">
            <h1 className="game__overlay-title">Missão cumprida!</h1>
            <p className="game__overlay-text">
              Pressione Enter ou clique para jogar novamente.
            </p>
            <button
              type="button"
              className="game__overlay-button"
              onClick={reiniciarJogo}
            >
              Jogar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
