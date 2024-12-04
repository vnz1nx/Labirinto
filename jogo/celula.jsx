import Objetivo from "./Objetivo";
import Personagem from "./Personagem";
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
  let objetvo = "";
  let personagem = "";
  let casaCastelo = "";

  const rio = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 12; j++) {
      rio.push([i, j]);
    }
  }

  const rioCastelo = [];
  for (let i = 5; i < 10; i++) {
    for (let j = 10; j < 23; j++) {
      rioCastelo.push([i, j]);
    }
  }

  for (let i = 5; i < 10; i++) {
    for (let j = 27; j < 48; j++) {
      rioCastelo.push([i, j]);
    }
  }

  const caminhos = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 5; i < 10; i++) {
    for (let j = 23; j < 24; j++) {
      caminhos.push([i, j]);
    }
  }
  const caminhos2 = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 5; i < 10; i++) {
    for (let j = 24; j < 26; j++) {
      caminhos2.push([i, j]);
    }
  }
  const caminhos3 = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 5; i < 10; i++) {
    for (let j = 26; j < 27; j++) {
      caminhos3.push([i, j]);
    }
  }

  const posicaoArvores = [];
  for (let i = 0; i < 2; i++) {
    for (let j = 10; j < 50; j++) {
      posicaoArvores.push([i, j]);
      posicaoArvores.push([j, i]);
    }
  }
  const posicaoArvores2 = [];
  for (let i = 48; i < 50; i++) {
    for (let j = 2; j < 50; j++) {
      posicaoArvores2.push([i, j]);
      posicaoArvores2.push([j, i]);
    }
  }
  const posicaoCastelo1 = [[3, 24]];
  const posicaoCastelo2 = [[2, 24]];
  const posicaoCastelo3 = [[3, 25]];
  const posicaoCastelo4 = [[2, 25]];

  const placa = [10, 22];

  if (coords[0] === jogador[0] && coords[1] === jogador[1]) {
    personagem = <Personagem key="Personagem" />;
    if (
      rio.some((pos) => pos[0] === jogador[0] && pos[1] === jogador[1]) ||
      rioCastelo.some((pos) => pos[0] === jogador[0] && pos[1] === jogador[1])
    ) {
      alert("Você afogou! Recarregue a página!");
      reiniciarJogo();
    }
  }

  if (coords[0] === objetivo[0] && coords[1] === objetivo[1]) {
    objetvo = <Objetivo key="Objetivo" />;
  }

  const obstaculoAtual = obst.find(
    (obst) => obst[0] === coords[0] && obst[1] === coords[1]
  );

  const LamaCapimAtual = LamaCapim.find(
    (LamaCapim) => LamaCapim[0] === coords[0] && LamaCapim[1] === coords[1]
  );

  if (obstaculoAtual) {
    const tipoObstaculo = obstaculoAtual[2];
    switch (tipoObstaculo) {
      case 1:
        bloco = <div className="arvore2 " key="arvore2"></div>;
        break;
      case 2:
        bloco = <div className="pedra" key="pedra"></div>;
        break;
    }
  }

  if (LamaCapimAtual) {
    const tipoLamaCapim = LamaCapimAtual[2];
    switch (tipoLamaCapim) {
      case 1:
        bloco = <div className="lama" key="lama"></div>;
        break;
      case 2:
        bloco = <div className="capim" key="capim"></div>;
        break;
    }
  }

  if (rio.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    bloco = <div className="rio" key="rio"></div>;
  } else if (
    caminhos.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte1" key="caminhoCastelo"></div>;
  } else if (
    caminhos2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte2" key="caminhoCastelo"></div>;
  } else if (
    caminhos3.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    ponte = <div className="ponte3" key="caminhoCastelo"></div>;
  } else if (
    posicaoArvores.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    bloco = <div className="arvore" key="arvore"></div>;
  } else if (
    posicaoArvores2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    bloco = <div className="arvore" key="arvore2"></div>;
  }
  if (
    posicaoCastelo1.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    casaCastelo = <div className="castelo1" key="castelo"></div>;
  } else if (
    posicaoCastelo2.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    casaCastelo = <div className="castelo2" key="castelo"></div>;
  } else if (
    posicaoCastelo3.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    casaCastelo = <div className="castelo3" key="castelo"></div>;
  } else if (
    posicaoCastelo4.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])
  ) {
    casaCastelo = <div className="castelo4" key="castelo"></div>;
  }
  if (rioCastelo.some((pos) => pos[0] === coords[0] && pos[1] === coords[1])) {
    bloco = <div className="rio" key="rio"></div>;
  }
  if (placa[0] === coords[0] && placa[1] === coords[1]) {
    bloco = <div className="placa" key="placa"></div>;
  }

  return (
    <div className="Celula">
      {bloco}
      {ponte}
      {casaCastelo}
      {personagem}
      {objetvo}
    </div>
  );
}
