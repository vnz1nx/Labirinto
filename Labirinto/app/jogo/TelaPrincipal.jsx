"use client";
import { useEffect, useState } from "react";
import RepGame from "./RepGame";
import "./Styles/StyleTelaPrincipal.css";

export default function TelaPrincipal() {
  const [iniciarJogo, setIniciarJogo] = useState(false);
  const [enableCursor, setEnableCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const handleChange = (event) => {
      setEnableCursor(event.matches);
    };

    setEnableCursor(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!enableCursor || iniciarJogo || typeof window === "undefined") {
      return;
    }

    const handleMouseMove = (event) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        setIsClicking(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enableCursor, iniciarJogo]);

  useEffect(() => {
    if (enableCursor && typeof window !== "undefined") {
      setCursorPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
  }, [enableCursor]);

  const iniciar = () => {
    setIniciarJogo(true);
  };

  return (
    <div className={`tela-principal ${iniciarJogo ? "jogo-iniciado" : ""}`}>
      {!iniciarJogo ? (
        <>
          {enableCursor && (
            <div
              className={`custom-cursor ${isClicking ? "is-clicking" : ""}`}
              style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }}
              aria-hidden="true"
            />
          )}
          <section className="intro-wrapper">
            <div className="intro-card">
              <div className="hero-illustration" aria-hidden="true">
                <span className="hero-spark hero-spark--one" />
                <span className="hero-spark hero-spark--two" />
              </div>
              <div className="intro-content">
                <span className="intro-tagline">Uma aventura luminosa</span>
                <h1 className="intro-title">Stuart e o Castelo Perdido</h1>
                <p className="intro-description">
                  Prepare-se para conduzir Stuart por um castelo repleto de enigmas, luzes
                  mágicas e desafios inesperados. Entre e descubra os segredos que brilham nas
                  sombras!
                </p>
                <button type="button" className="linkjogo" onClick={iniciar}>
                  Começar aventura
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <RepGame />
      )}
    </div>
  );
}
