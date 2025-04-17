import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { ethers } from "ethers";
import abi from "./utils/TicTacToeABI.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x937461392949C767c2d1D827387dF7753387F991";

const AI_AVATAR = {
  name: "Tico the Bot 🤖",
};

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [gameStatus, setGameStatus] = useState("Waiting for players...");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [mode, setMode] = useState("single");
  const [winner, setWinner] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [winningCombo, setWinningCombo] = useState([]);
  const [startingTurn, setStartingTurn] = useState("X");
  const [difficulty, setDifficulty] = useState("medium");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [music] = useState(new Audio("/bg-music.mp3"));
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    music.loop = true;
  }, []);

  useEffect(() => {
    localStorage.setItem("tictactoe-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (mode === "single" && turn !== startingTurn && !winner) {
      const aiMoveTimeout = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [turn, board, mode, winner, difficulty]);

  useEffect(() => {
    if (musicPlaying) music.play();
    else music.pause();
  }, [musicPlaying]);

  const checkWalletConnection = async () => {
    const { ethereum } = window;
    if (!ethereum) return;
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) setCurrentAccount(accounts[0]);
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setCurrentAccount(accounts[0]);
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;
    if (mode === "single" && turn !== startingTurn) return;
    if (mode === "local" && winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    triggerEmojiReaction();
    checkWinner(newBoard);
    setTurn(turn === "X" ? "O" : "X");
  };

  const makeAIMove = () => {
    if (winner) return;

    let index;
    const empty = board.map((c, i) => (c === "" ? i : null)).filter((i) => i !== null);

    if (difficulty === "easy") {
      index = empty[Math.floor(Math.random() * empty.length)];
    } else if (difficulty === "medium" && Math.random() < 0.3) {
      index = empty[Math.floor(Math.random() * empty.length)];
    } else {
      const isMaximizing = startingTurn !== turn;
      const maxDepth = difficulty === "medium" ? 3 : 6;
      const { move } = minimax([...board], maxDepth, isMaximizing, turn);
      index = move;
    }

    if (index !== undefined) {
      const newBoard = [...board];
      newBoard[index] = turn;
      setBoard(newBoard);
      triggerEmojiReaction();
      checkWinner(newBoard);
      setTurn(turn === "X" ? "O" : "X");
    }
  };

  const minimax = (b, depth, isMaximizing, currentTurn) => {
    const win = getWinner(b);
    if (win === startingTurn) return { score: 10 - (6 - depth) };
    if (win && win !== startingTurn) return { score: -10 + (6 - depth) };
    if (!b.includes("")) return { score: 0 };
    if (depth === 0) return { score: 0 };

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
      if (b[i] === "") {
        b[i] = currentTurn;
        const nextTurn = currentTurn === "X" ? "O" : "X";
        const { score } = minimax(b, depth - 1, !isMaximizing, nextTurn);
        b[i] = "";
        if (isMaximizing && score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
        if (!isMaximizing && score < bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return { score: bestScore, move: bestMove };
  };

  const getWinner = (b) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) return b[a];
    }
    return null;
  };

  const checkWinner = (b) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        setWinner(b[a]);
        setGameStatus(`${b[a]} wins! 🎉`);
        setWinningCombo([a, bIdx, c]);
        setHistory((prev) => [
          { board: [...b], winner: b[a] },
          ...prev.slice(0, 2),
        ]);
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          emojis: ["🎉", "🔥", "✨", "🏆"]
        });
        return;
      }
    }

    if (!b.includes("")) {
      setGameStatus("Draw! 🤝");
    } else {
      setGameStatus(`Turn: ${turn === "X" ? "O" : "X"}`);
    }
  };

  const resetGame = () => {
    const nextStart = startingTurn === "X" ? "O" : "X";
    setStartingTurn(nextStart);
    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn(nextStart);
    setWinningCombo([]);
    setGameStatus("Game restarted!");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const triggerEmojiReaction = () => {
    const emoji = document.createElement("div");
    emoji.className = "floating-emoji";
    emoji.innerText = ["😄", "😎", "🔥", "🎯", "🥳"][Math.floor(Math.random() * 5)];
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1000);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <h1 className="title">Tic Tac Toe DApp 🎮</h1>

      {mode === "single" && <h2 className="ai-avatar">Playing against: {AI_AVATAR.name}</h2>}
      {mode === "local" && <h2 className="ai-avatar">Local 2 Player Mode 👥</h2>}

      <div className="controls">
        <button onClick={resetGame} className="control-button">♻️ Reset</button>

        <select
          className="control-button"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="single">🤖 Single vs AI</option>
          <option value="local">👥 Local 2 Player</option>
          <option value="contract">🌐 Smart Contract</option>
        </select>

        <select
          className="control-button"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={mode !== "single"}
        >
          <option value="easy">😭 Easy</option>
          <option value="medium">😐 Medium</option>
          <option value="hard">🧠 Hard</option>
        </select>

        <button onClick={toggleDarkMode} className="control-button">
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        <button onClick={() => setMusicPlaying(!musicPlaying)} className="control-button">
          {musicPlaying ? "🎶 Stop Music" : "🎵 Play Music"}
        </button>

        <button onClick={() => setShowRules(!showRules)} className="control-button">
          📜 {showRules ? "Hide Rules" : "Show Rules"}
        </button>
      </div>

      {showRules && (
        <div className="rules">
          <h2>Game Rules</h2>
          <ul>
            <li>Players take turns placing their mark (X or O) on the board.</li>
            <li>The first player to get three in a row (horizontally, vertically, or diagonally) wins.</li>
            <li>If all 9 cells are filled without a winner, the game ends in a draw.</li>
            <li>Choose AI difficulty and game mode before starting.</li>
            <li>You can reset the game anytime using the ♻️ Reset button.</li>
          </ul>
        </div>
      )}

      <div className="turn-indicator">{!winner ? `Turn: ${turn}` : null}</div>

      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${winningCombo.includes(index) ? "winning-cell" : ""}`}
            onClick={() => handleClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>

      <div className="status">{gameStatus}</div>

      {currentAccount ? (
        <div className="account">Connected: {currentAccount}</div>
      ) : (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      )}

      <div className="history">
        <h2>Last Games</h2>
        {history.map((game, idx) => (
          <div key={idx} className="history-entry">
            <span>Winner: {game.winner}</span>
            <div className="mini-board">
              {game.board.map((c, i) => (
                <div key={i} className="mini-cell">{c}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}