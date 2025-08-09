import Objetivo from "./Obj_Perso/Objetivo";
import Personagem from "./Obj_Perso/Personagem";
import "./Styles/StyleCelula.css";

export default function Celula({
  coords,
  jogador,
  objetivo,
  obst,
  reiniciarJogo,
  LamaCapim,
}) {
  let bloco = "";
  let ponte = "";
  let objetivoComp = "";
  let personagem = "";
  let casaCastelo = "";

  // Função auxiliar para gerar coordenadas
  const gerarCoords = (xIni, xFim, yIni, yFim) => {
    const arr = [];
    for (let i = xIni; i < xFim; i++) {
      for (let j = yIni; j < yFim; j++) {
        arr.push([i, j]);
      }
    }
    return arr;
  };

  const rio = gerarCoords(0, 10, 0, 12);
  const rioCastelo = [
    ...gerarCoords(5, 10, 10, 23),
    ...gerarCoords(5, 10, 27, 48),
  ];

  const caminhos = gerarCoords(5, 10, 23, 24);
  const caminhos2 = gerarCoords(5, 10, 24, 26);
  const caminhos3 = gerarCoords(5, 10, 26, 27);

  const posicaoArvores = [
    ...gerarCoords(0, 3, 10, 80),
    ...gerarCoords(10, 80, 0, 3),
  ];

  const posicaoArvores3 = gerarCoords(10, 48, 3, 10);

  const posicaoArvores2 = [
    ...gerarCoords(48, 80, 0, 50),
    ...gerarCoords(0, 50, 48, 80),
  ];

  const posicaoCastelo1 = [[4, 24]];
  const posicaoCastelo2 = [[3, 24]];
  const posicaoCastelo3 = [[4, 25]];
  const posicaoCastelo4 = [[3, 25]];

  const placa = [10, 22];

  const todosOsObstaculos = [
    ...obst,
    ...posicaoArvores,
    ...posicaoArvores2,
    ...posicaoArvores3,
    ...posicaoCastelo1,
    ...posicaoCastelo2,
    ...posicaoCastelo3,
    ...posicaoCastelo4,
    ...rio,
    ...rioCastelo,
    ...caminhos,
    ...caminhos2,
    ...caminhos3,
    placa,
  ];

  const obstaculoNoCaminho = todosOsObstaculos.some(
    (pos) => pos[0] === coords[0] && pos[1] === coords[1]
  );

  // Renderiza objetivo
  if (
    coords[0] === objetivo[0] &&
    coords[1] === objetivo[1] &&
    !obstaculoNoCaminho
  ) {
    objetivoComp = <Objetivo />;
  }

  // Renderiza personagem
  if (coords[0] === jogador[0] && coords[1] === jogador[1]) {
    personagem = <Personagem />;

    if (
      jogador[0] === objetivo[0] &&
      jogador[1] === objetivo[1] &&
      obstaculoNoCaminho
    ) {
      reiniciarJogo();
    }

    if (
      rio.some((pos) => pos[0] === jogador[0] && pos[1] === jogador[1]) ||
      rioCastelo.some(
        (pos) => pos[0] === jogador[0] && pos[1] === jogador[1]
      )
    ) {
      reiniciarJogo();
    }
  }

  // Verifica obstáculos
  const obstaculoAtual = obst.find(
    (pos) => pos[0] === coords[0] && pos[1] === coords[1]
  );

  const LamaCapimAtual = LamaCapim.find(
    (pos) => pos[0] === coords[0] && pos[1] === coords[1]
  );

  if (obstaculoAtual) {
    switch (obstaculoAtual[2]) {
      case 1:
        bloco = <div className="arvore2" key="arvore2"></div>;
        break;
      case 2:
        bloco = <div className="pedra" key="pedra"></div>;
        break;
    }
  }

  if (LamaCapimAtual) {
    switch (LamaCapimAtual[2]) {
      case 1:
        bloco = <div className="lama" key="lama"></div>;
        break;
      case 2:
        bloco = <div className="capim" key="capim"></div>;
        break;
    }
  }

  // Checagem de terrenos e construções
  if (rio.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    bloco = <div className="rio" key="rio"></div>;
  } else if (
    caminhos.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte1" key="ponte1"></div>;
  } else if (
    caminhos2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte2" key="ponte2"></div>;
  } else if (
    caminhos3.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte3" key="ponte3"></div>;
  } else if (
    posicaoArvores.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    bloco = <div className="arvore" key="arvore1"></div>;
  } else if (
    posicaoArvores2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    bloco = <div className="arvore" key="arvore2"></div>;
  } else if (
    posicaoArvores3.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    bloco = <div className="arvore" key="arvore3"></div>;
  }

  if (posicaoCastelo1.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    casaCastelo = <div className="castelo1" key="castelo1"></div>;
  } else if (posicaoCastelo2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    casaCastelo = <div className="castelo2" key="castelo2"></div>;
  } else if (posicaoCastelo3.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    casaCastelo = <div className="castelo3" key="castelo3"></div>;
  } else if (posicaoCastelo4.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    casaCastelo = <div className="castelo4" key="castelo4"></div>;
  }

  if (rioCastelo.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    bloco = <div className="rio" key="rio2"></div>;
  }

  if (placa[0] === coords[0] && placa[1] === coords[1]) {
    bloco = <div className="placa" key="placa"></div>;
  }

  return (
    <div className="Celula">
      {bloco}
      {ponte}
      {casaCastelo}
      {objetivoComp}
      {personagem}
    </div>
  );
}
