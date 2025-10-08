"use client";
import { useState } from "react";
import RepGame from "./RepGame";
import "./Styles/StyleTelaPrincipal.css";

export default function TelaPrincipal() {
  const [iniciarJogo, setIniciarJogo] = useState(false);

  const iniciar = () => {
    setIniciarJogo(true);
  };

  return (
    <div>
      {!iniciarJogo ? (
        <div className="container">
          <div className="personagem" />
          <h3 className="tituloJogo">Stuart e o castelo perdido!</h3>
          <button className="linkjogo" onClick={iniciar}>
            Entrar
          </button>
        </div>
      ) : (
        <RepGame />
      )}
    </div>
  );
}
