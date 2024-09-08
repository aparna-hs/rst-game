import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
const AlertCircle = () => <span>⚠️</span>;
const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');

const RST_Game = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    socket.on('updateGame', (gameState) => {
      setPlayers(gameState.players);
      setCurrentPlayer(gameState.currentPlayer);
      setGameStarted(gameState.gameStarted);
      setCurrentWord(gameState.currentWord);
      setTimer(gameState.timer);
      setGameOver(gameState.gameOver);
      setWinner(gameState.winner);
    });

    socket.on('timerUpdate', (time) => {
      setTimer(time);
    });

    return () => {
      socket.off('updateGame');
      socket.off('timerUpdate');
    };
  }, []);

  const joinGame = () => {
    if (playerName.trim() !== '') {
      socket.emit('joinGame', playerName.trim());
      setPlayerName('');
    }
  };

  const startGame = () => {
    socket.emit('startGame');
  };

  const submitWord = (word) => {
    if (word.trim() !== '') {
      socket.emit('submitWord', word.trim());
    }
  };

  return (
    <Card className="w-96 mx-auto">
      <CardHeader className="text-2xl font-bold text-center">R,S,T Word Game</CardHeader>
      <CardContent>
        {!gameStarted ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
              <Button onClick={joinGame}>Join Game</Button>
            </div>
            <ul className="list-disc list-inside">
              {players.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
            <Button onClick={startGame} disabled={players.length < 2}>
              Start Game
            </Button>
          </div>
        ) : gameOver ? (
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">Game Over!</p>
            <p>Winner: {winner}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Current Player: {currentPlayer}</p>
            <p>Previous Word: {currentWord || 'None'}</p>
            <p>Time Left: {timer}s</p>
            <div className="flex space-x-2">
              <Input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitWord(e.target.value);
                    e.target.value = '';
                  }
                }}
                placeholder="Enter a word"
              />
              <Button onClick={(e) => submitWord(e.target.previousSibling.value)}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle size={16} />
          <p className="text-sm">Don't start with R, S, or T!</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RST_Game;