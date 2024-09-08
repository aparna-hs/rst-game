const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let gameState = {
  players: [],
  currentPlayer: '',
  gameStarted: false,
  currentWord: '',
  timer: 5,
  gameOver: false,
  winner: null
};

let timerInterval;

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', (playerName) => {
    if (!gameState.players.includes(playerName)) {
      gameState.players.push(playerName);
      io.emit('updateGame', gameState);
    }
  });

  socket.on('startGame', () => {
    if (gameState.players.length >= 2) {
      gameState.gameStarted = true;
      gameState.currentPlayer = gameState.players[0];
      startTimer();
      io.emit('updateGame', gameState);
    }
  });

  socket.on('submitWord', (word) => {
    if (gameState.gameStarted && !gameState.gameOver) {
      if (word.toLowerCase().startsWith('r') || 
          word.toLowerCase().startsWith('s') || 
          word.toLowerCase().startsWith('t')) {
        endGame();
      } else {
        gameState.currentWord = word;
        const currentPlayerIndex = gameState.players.indexOf(gameState.currentPlayer);
        gameState.currentPlayer = gameState.players[(currentPlayerIndex + 1) % gameState.players.length];
        resetTimer();
        io.emit('updateGame', gameState);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

function startTimer() {
  clearInterval(timerInterval);
  gameState.timer = 5;
  timerInterval = setInterval(() => {
    gameState.timer--;
    io.emit('timerUpdate', gameState.timer);
    if (gameState.timer === 0) {
      endGame();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
}

function endGame() {
  clearInterval(timerInterval);
  gameState.gameOver = true;
  gameState.winner = gameState.players[(gameState.players.indexOf(gameState.currentPlayer) - 1 + gameState.players.length) % gameState.players.length];
  io.emit('updateGame', gameState);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));