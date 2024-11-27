import { useState } from "react";
import GameScene from "./GameScene";
import Menu from "./Menu";  // Asegúrate de que el componente Menu esté importado

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);  // Cambia el estado para iniciar el juego
  };

  return (
    <div style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      {gameStarted ? (
        <GameScene />
      ) : (
        <Menu onStartGame={startGame} />
      )}
    </div>
  );
};

export default App;
