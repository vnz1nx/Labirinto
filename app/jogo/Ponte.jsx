const TAMANHO_CELULA = 32; // ajuste para o tamanho real da sua célula em px

export default function Ponte({ startX, startY, width, height, tipo }) {
  const imagens = {
    ponte1: '/images/ponte1.png', // troque pelo caminho real da imagem
    ponte2: '/images/ponte2.png',
    ponte3: '/images/ponte3.png',
  };

  const style = {
    position: 'absolute',
    left: startX * TAMANHO_CELULA,
    top: startY * TAMANHO_CELULA,
    width: width * TAMANHO_CELULA,
    height: height * TAMANHO_CELULA,
    backgroundImage: `url(${imagens[tipo]})`,
    backgroundSize: 'cover',
    pointerEvents: 'none',
  };

  return <div style={style} />;
}
