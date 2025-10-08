"use client";
import React from "react";
import "./Styles/StyleRepGame.css";

export default function TelaInicial({ iniciarJogo }) {
  return (
    <div className="start-panel">
      <div className="start-panel__figure" aria-hidden="true" />
      <h1 className="start-panel__title">Stuart e o Castelo Perdido</h1>
      <p className="start-panel__subtitle">
        Ajude Stuart a recuperar a Excalibur no labirinto mágico e escapar das
        armadilhas da floresta.
      </p>
      <button className="start-panel__button" onClick={iniciarJogo}>
        Iniciar aventura
      </button>
    </div>
  );
}
