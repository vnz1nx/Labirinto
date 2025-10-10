"use client";
import { useEffect, useState } from "react";
import RepGame from "./RepGame";
import "./Styles/StyleTelaPrincipal.css";

export default function TelaPrincipal() {
  const [iniciarJogo, setIniciarJogo] = useState(false);

  useEffect(() => {
    const { body } = document;

    if (!body) {
      return undefined;
    }

    if (iniciarJogo) {
      body.classList.add("body--game");
      body.classList.remove("body--start");
    } else {
      body.classList.add("body--start");
      body.classList.remove("body--game");
    }

    return () => {
      body.classList.remove("body--start");
      body.classList.remove("body--game");
    };
  }, [iniciarJogo]);

  const iniciar = () => {
    setIniciarJogo(true);
  };

  return (
    <div>
      {!iniciarJogo ? (
        <div className="start-screen">
          <div className="start-screen__hero" aria-hidden="true" />
          <h3 className="start-screen__title">Stuart e o castelo perdido!</h3>
          <button className="start-screen__button" onClick={iniciar}>
            Entrar
          </button>
        </div>
      ) : (
        <RepGame />
      )}
    </div>
  );
}
