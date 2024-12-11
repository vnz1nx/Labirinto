"use client";
import React from "react";
import "./Styles/StyleRepGame.css";

export default function TelaInicial({ iniciarJogo }) {
  return (
    <div className="conteiner2">
      <h1 className="tituloJogo">Stuart e o castelo perdido!</h1>
      <button className="linkjogo" onClick={iniciarJogo}>
        Entrar
      </button>
      <div className="personagem"></div>
    </div>
  );
}
