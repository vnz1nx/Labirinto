"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./Styles/StyleRepGame.css";
import Tabuleiro from "./Tabuleiro";
import {
  CASTLE_TILE_KEYS,
  CASTLE_TILE_POSITIONS,
  COLLISION_BLOCKERS,
  DANGER_RIVER_TILES,
  STATIC_BLOCKERS,
  coordKey,
} from "./mapTiles";

const LIMITES = { minX: 3, maxX: 47, minY: 10, maxY: 47 };
const OBSTACLE_COUNT = 160;
const DIRECOES = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const MOVIMENTOS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};
const MAX_TENTATIVAS_CENARIO = 60;

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

const gerarPosicaoLivre = (
  ocupadas = [],
  obstaculos = [],
  blocosFixos = STATIC_BLOCKERS
) => {
  const ocupadasSet = new Set(ocupadas.map(([x, y]) => coordKey(x, y)));
  const obstaculosSet = new Set(obstaculos.map(([x, y]) => coordKey(x, y)));
  const blocosFixosSet = blocosFixos ?? new Set();
  let ultimaTentativa = [LIMITES.minX, LIMITES.minY];

  for (let tentativas = 0; tentativas < 500; tentativas++) {
    const posicao = [
      numeroAleatorio(15, 47),
      numeroAleatorio(12, 47),
    ];
    const chave = coordKey(posicao[0], posicao[1]);
    const tileCastelo = CASTLE_TILE_KEYS.has(chave);

    if (
      !ocupadasSet.has(chave) &&
      !obstaculosSet.has(chave) &&
      !blocosFixosSet.has(chave) &&
      !tileCastelo
    ) {
      return posicao;
    }

    ultimaTentativa = posicao;
  }

  for (let x = LIMITES.minX; x <= LIMITES.maxX; x++) {
    for (let y = LIMITES.minY; y <= LIMITES.maxY; y++) {
      const chave = coordKey(x, y);
      if (
        !ocupadasSet.has(chave) &&
        !obstaculosSet.has(chave) &&
        !blocosFixosSet.has(chave)
      ) {
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

const estaDentroDoLimite = (x, y) =>
  x >= LIMITES.minX &&
  x <= LIMITES.maxX &&
  y >= LIMITES.minY &&
  y <= LIMITES.maxY;

const reconstruirCaminho = (pais, destino) => {
  const caminho = [];
  let passoAtual = destino;

  while (passoAtual) {
    const [px, py] = passoAtual.split("-").map(Number);
    caminho.push([px, py]);
    passoAtual = pais.get(passoAtual) ?? null;
  }

  return caminho.reverse();
};

const normalizarAlvos = (alvos) => {
  if (!alvos) {
    return new Set();
  }

  if (Array.isArray(alvos) && alvos.length === 2 && alvos.every(Number.isFinite)) {
    return new Set([coordKey(alvos[0], alvos[1])]);
  }

  if (Array.isArray(alvos)) {
    return new Set(alvos.map(([x, y]) => coordKey(x, y)));
  }

  return new Set(alvos);
};

const encontrarCaminhoLivre = (inicio, alvos, { permitirCastelo = false } = {}) => {
  if (!inicio || inicio.length !== 2) {
    return null;
  }

  const destinoSet = normalizarAlvos(alvos);
  if (!destinoSet.size) {
    return null;
  }

  const fila = [];
  const visitados = new Set();
  const pais = new Map();

  const chaveInicial = coordKey(inicio[0], inicio[1]);
  fila.push(inicio);
  visitados.add(chaveInicial);
  pais.set(chaveInicial, null);

  while (fila.length) {
    const [cx, cy] = fila.shift();
    const chaveAtual = coordKey(cx, cy);

    if (destinoSet.has(chaveAtual)) {
      return reconstruirCaminho(pais, chaveAtual);
    }

    for (const [dx, dy] of DIRECOES) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (!estaDentroDoLimite(nx, ny)) {
        continue;
      }

      const chaveVizinho = coordKey(nx, ny);
      if (visitados.has(chaveVizinho)) {
        continue;
      }

      const ehCastelo = CASTLE_TILE_KEYS.has(chaveVizinho);
      const ehPerigoso = DANGER_RIVER_TILES.has(chaveVizinho);
      const ehColisao = COLLISION_BLOCKERS.has(chaveVizinho) && !ehCastelo;

      if (ehPerigoso || ehColisao) {
        if (!(permitirCastelo && ehCastelo && destinoSet.has(chaveVizinho))) {
          continue;
        }
      }

      visitados.add(chaveVizinho);
      pais.set(chaveVizinho, chaveAtual);
      fila.push([nx, ny]);
    }
  }

  return null;
};

const lapidarObstaculosParaFluxo = (
  obstaculos,
  jogador,
  caminhoObjetivo,
  caminhoCastelo
) => {
  if (!jogador || jogador.length !== 2) {
    return obstaculos;
  }

  const faixas = [];

  if (jogador.length === 2) {
    faixas.push(expandirCorredor([jogador], 2));
  }

  if (Array.isArray(caminhoObjetivo) && caminhoObjetivo.length) {
    faixas.push(expandirCorredor(caminhoObjetivo, 1));
  }

  if (Array.isArray(caminhoCastelo) && caminhoCastelo.length) {
    faixas.push(expandirCorredor(caminhoCastelo, 1));
  }

  return removerObstaculosEmFaixas(obstaculos, faixas);
};

const criarNovoCenario = () => {
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_CENARIO; tentativa++) {
    const obstaculosIniciais = gerarObstaculos();
    const terrenosIniciais = gerarTerrenos();
    const objetivoInicial = gerarPosicaoLivre([], obstaculosIniciais);
    const jogadorInicial = gerarPosicaoLivre(
      [objetivoInicial],
      obstaculosIniciais
    );

    const caminhoParaObjetivo = encontrarCaminhoLivre(
      jogadorInicial,
      [objetivoInicial]
    );
    const caminhoParaCastelo = encontrarCaminhoLivre(
      objetivoInicial,
      CASTLE_TILE_POSITIONS,
      { permitirCastelo: true }
    );

    if (!caminhoParaObjetivo || !caminhoParaCastelo) {
      continue;
    }

    const obstaculosLapidados = lapidarObstaculosParaFluxo(
      obstaculosIniciais,
      jogadorInicial,
      caminhoParaObjetivo,
      caminhoParaCastelo
    );

    return {
      obstaculos: obstaculosLapidados,
      terrenos: terrenosIniciais,
      objetivo: objetivoInicial,
      jogador: jogadorInicial,
    };
  }

  console.warn(
    "Não foi possível gerar um cenário válido com caminhos pré-abertos. Aplicando cenário padrão sem obstáculos."
  );

  const fallbackObstaculos = [];
  const fallbackObjetivo = gerarPosicaoLivre([], fallbackObstaculos);
  const fallbackJogador = gerarPosicaoLivre(
    [fallbackObjetivo],
    fallbackObstaculos
  );

  return {
    obstaculos: fallbackObstaculos,
    terrenos: gerarTerrenos(),
    objetivo: fallbackObjetivo,
    jogador: fallbackJogador,
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

      if (COLLISION_BLOCKERS.has(proximaChave)) {
        return null;
      }

      if (DANGER_RIVER_TILES.has(proximaChave)) {
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
