import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Crown, 
  RotateCcw, 
  SkipBack, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCw,
  Download,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GameEndDialog } from './GameEndDialog';
import { SettingsDialog } from './SettingsDialog';

export interface ChessGameProps {
  className?: string;
}

interface GameState {
  game: Chess;
  gameHistory: string[];
  capturedPieces: {
    white: string[];
    black: string[];
  };
  lastMove: {
    from: string;
    to: string;
  } | null;
  selectedSquare: string | null;
  legalMoves: string[];
  isFlipped: boolean;
  soundEnabled: boolean;
  timeControl: {
    white: number;
    black: number;
    increment: number;
  };
  isTimerRunning: boolean;
  boardTheme: string;
}

const initialTimeControl = {
  white: 10 * 60, // 10 minutes
  black: 10 * 60,
  increment: 0
};

const PIECE_SYMBOLS: { [key: string]: string } = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};

export const ChessGame: React.FC<ChessGameProps> = ({ className }) => {
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout>();
  
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load saved game from localStorage
    const savedGame = localStorage.getItem('chess-game-state');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        const game = new Chess();
        game.loadPgn(parsed.pgn);
        return {
          game,
          gameHistory: parsed.gameHistory,
          capturedPieces: parsed.capturedPieces,
          lastMove: parsed.lastMove,
          selectedSquare: null,
          legalMoves: [],
      isFlipped: parsed.isFlipped || false,
      soundEnabled: parsed.soundEnabled !== false,
      timeControl: parsed.timeControl || initialTimeControl,
      isTimerRunning: false,
      boardTheme: parsed.boardTheme || 'classic'
        };
      } catch (error) {
        console.error('Failed to load saved game:', error);
      }
    }
    
    return {
      game: new Chess(),
      gameHistory: [],
      capturedPieces: { white: [], black: [] },
      lastMove: null,
      selectedSquare: null,
      legalMoves: [],
      isFlipped: false,
      soundEnabled: true,
      timeControl: { ...initialTimeControl },
      isTimerRunning: false,
      boardTheme: 'classic'
    };
  });

  // Save game state to localStorage
  const saveGameState = useCallback((state: GameState) => {
    const saveData = {
      pgn: state.game.pgn(),
      gameHistory: state.gameHistory,
      capturedPieces: state.capturedPieces,
      lastMove: state.lastMove,
      isFlipped: state.isFlipped,
      soundEnabled: state.soundEnabled,
      timeControl: state.timeControl,
      boardTheme: state.boardTheme
    };
    localStorage.setItem('chess-game-state', JSON.stringify(saveData));
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isTimerRunning && !gameState.game.isGameOver()) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newState = { ...prev };
          const currentPlayer = prev.game.turn();
          
          if (currentPlayer === 'w') {
            newState.timeControl.white = Math.max(0, prev.timeControl.white - 1);
            if (newState.timeControl.white === 0) {
              newState.isTimerRunning = false;
              toast({
                title: "Time's up!",
                description: "White ran out of time. Black wins!",
                variant: "destructive"
              });
            }
          } else {
            newState.timeControl.black = Math.max(0, prev.timeControl.black - 1);
            if (newState.timeControl.black === 0) {
              newState.isTimerRunning = false;
              toast({
                title: "Time's up!",
                description: "Black ran out of time. White wins!",
                variant: "destructive"
              });
            }
          }
          
          return newState;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isTimerRunning, gameState.game, toast]);

  // Play sound effect
  const playSound = useCallback((type: 'move' | 'capture' | 'check' | 'gameEnd') => {
    if (!gameState.soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
      case 'capture':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        break;
      case 'check':
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        break;
      case 'gameEnd':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [gameState.soundEnabled]);

  // Handle piece move
  const handleMove = useCallback((sourceSquare: Square, targetSquare: Square) => {
    setGameState(prev => {
      const newGame = new Chess(prev.game.fen());
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Auto-promote to queen for simplicity
      });

      if (!move) return prev;

      // Update captured pieces
      const newCapturedPieces = { ...prev.capturedPieces };
      if (move.captured) {
        const capturedPiece = move.color === 'w' ? 'b' + move.captured.toUpperCase() : 'w' + move.captured.toUpperCase();
        const capturedBy = move.color === 'w' ? 'white' : 'black';
        newCapturedPieces[capturedBy].push(capturedPiece);
        playSound('capture');
      } else {
        playSound('move');
      }

      // Check for check or game end
      if (newGame.isCheck()) {
        playSound('check');
      }
      if (newGame.isGameOver()) {
        playSound('gameEnd');
      }

      // Add time increment
      const newTimeControl = { ...prev.timeControl };
      if (prev.isTimerRunning) {
        if (move.color === 'w') {
          newTimeControl.white += prev.timeControl.increment;
        } else {
          newTimeControl.black += prev.timeControl.increment;
        }
      }

      const newState = {
        ...prev,
        game: newGame,
        gameHistory: [...prev.gameHistory, move.san],
        capturedPieces: newCapturedPieces,
        lastMove: { from: sourceSquare, to: targetSquare },
        selectedSquare: null,
        legalMoves: [],
        timeControl: newTimeControl,
        isTimerRunning: prev.isTimerRunning && !newGame.isGameOver()
      };

      saveGameState(newState);
      return newState;
    });
  }, [playSound, saveGameState]);

  // Handle square click
  const handleSquareClick = useCallback((square: Square) => {
    setGameState(prev => {
      const piece = prev.game.get(square);
      
      if (prev.selectedSquare === square) {
        // Deselect
        return {
          ...prev,
          selectedSquare: null,
          legalMoves: []
        };
      }
      
      if (prev.selectedSquare && prev.legalMoves.includes(square)) {
        // Make move
        handleMove(prev.selectedSquare as Square, square);
        return prev;
      }
      
      if (piece && piece.color === prev.game.turn()) {
        // Select piece
        const moves = prev.game.moves({ square, verbose: true });
        return {
          ...prev,
          selectedSquare: square,
          legalMoves: moves.map(move => move.to)
        };
      }
      
      return prev;
    });
  }, [handleMove]);

  // Reset game
  const resetGame = useCallback(() => {
    const newState: GameState = {
      game: new Chess(),
      gameHistory: [],
      capturedPieces: { white: [], black: [] },
      lastMove: null,
      selectedSquare: null,
      legalMoves: [],
      isFlipped: gameState.isFlipped,
      soundEnabled: gameState.soundEnabled,
      timeControl: { ...initialTimeControl },
      isTimerRunning: false,
      boardTheme: gameState.boardTheme
    };
    
    setGameState(newState);
    saveGameState(newState);
    
    toast({
      title: "Game Reset",
      description: "A new game has started!"
    });
  }, [gameState.isFlipped, gameState.soundEnabled, saveGameState, toast]);

  // Undo last move
  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.gameHistory.length === 0) return prev;
      
      const newGame = new Chess();
      const newHistory = [...prev.gameHistory];
      newHistory.pop(); // Remove last move
      
      // Replay all moves except the last one
      newHistory.forEach(move => {
        newGame.move(move);
      });
      
      // Recalculate captured pieces
      const newCapturedPieces = { white: [], black: [] };
      const history = newGame.history({ verbose: true });
      history.forEach(move => {
        if (move.captured) {
          const capturedPiece = move.color === 'w' ? 'b' + move.captured.toUpperCase() : 'w' + move.captured.toUpperCase();
          const capturedBy = move.color === 'w' ? 'white' : 'black';
          newCapturedPieces[capturedBy].push(capturedPiece);
        }
      });
      
      const lastMove = history.length > 0 ? 
        { from: history[history.length - 1].from, to: history[history.length - 1].to } : 
        null;
      
      const newState = {
        ...prev,
        game: newGame,
        gameHistory: newHistory,
        capturedPieces: newCapturedPieces,
        lastMove,
        selectedSquare: null,
        legalMoves: []
      };
      
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Toggle board orientation
  const flipBoard = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isFlipped: !prev.isFlipped };
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, soundEnabled: !prev.soundEnabled };
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Start/pause timer
  const toggleTimer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isTimerRunning: !prev.isTimerRunning
    }));
  }, []);

  // Export game as PGN
  const exportPGN = useCallback(() => {
    const pgn = gameState.game.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Game Exported",
      description: "PGN file has been downloaded!"
    });
  }, [gameState.game, toast]);

  // Update time control
  const updateTimeControl = useCallback((newTimeControl: { white: number; black: number; increment: number }) => {
    setGameState(prev => {
      const newState = { ...prev, timeControl: newTimeControl };
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Update board theme
  const updateBoardTheme = useCallback((theme: string) => {
    setGameState(prev => {
      const newState = { ...prev, boardTheme: theme };
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Game status
  const getGameStatus = () => {
    if (gameState.game.isCheckmate()) {
      const winner = gameState.game.turn() === 'w' ? 'Black' : 'White';
      return { status: 'checkmate', message: `Checkmate! ${winner} wins!`, variant: 'destructive' as const };
    }
    if (gameState.game.isStalemate()) {
      return { status: 'stalemate', message: 'Draw by stalemate', variant: 'secondary' as const };
    }
    if (gameState.game.isDraw()) {
      return { status: 'draw', message: 'Game drawn', variant: 'secondary' as const };
    }
    if (gameState.game.isCheck()) {
      const player = gameState.game.turn() === 'w' ? 'White' : 'Black';
      return { status: 'check', message: `${player} is in check!`, variant: 'default' as const };
    }
    
    const currentPlayer = gameState.game.turn() === 'w' ? 'White' : 'Black';
    return { status: 'playing', message: `${currentPlayer} to move`, variant: 'outline' as const };
  };

  const gameStatus = getGameStatus();

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-4 space-y-6", className)}>
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-primary" />
          Chess Master
        </h1>
        <Badge variant={gameStatus.variant} className="text-lg px-4 py-2">
          {gameStatus.message}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Panel - Player Info & Captured Pieces */}
        <Card className="xl:col-span-1 bg-game-panel border-game-panel-border shadow-game-panel">
          <div className="p-4 space-y-4">
            {/* Black Player */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-game-player-black rounded-full border-2 border-game-panel-border" />
                  <span className="font-semibold">Black</span>
                </div>
                <div className={cn(
                  "font-mono text-lg px-2 py-1 rounded border",
                  gameState.timeControl.black < 60 ? "bg-game-timer-danger text-white" :
                  gameState.timeControl.black < 300 ? "bg-game-timer-warning text-white" :
                  "bg-muted"
                )}>
                  {formatTime(gameState.timeControl.black)}
                </div>
              </div>
              <div className="min-h-[60px] p-2 bg-muted rounded border">
                <div className="text-sm text-muted-foreground mb-1">Captured:</div>
                <div className="flex flex-wrap gap-1">
                  {gameState.capturedPieces.black.map((piece, index) => (
                    <span key={index} className="text-xl">
                      {PIECE_SYMBOLS[piece]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Game Controls */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoMove}
                  disabled={gameState.gameHistory.length === 0}
                  className="flex items-center gap-1"
                >
                  <SkipBack className="w-4 h-4" />
                  Undo
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={flipBoard}
                  className="flex items-center gap-1"
                >
                  <RotateCw className="w-4 h-4" />
                  Flip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSound}
                  className="flex items-center gap-1"
                >
                  {gameState.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  Sound
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTimer}
                  className="flex items-center gap-1"
                >
                  {gameState.isTimerRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Timer
                </Button>
                <SettingsDialog
                  soundEnabled={gameState.soundEnabled}
                  onSoundToggle={toggleSound}
                  timeControl={gameState.timeControl}
                  onTimeControlChange={updateTimeControl}
                  boardTheme={gameState.boardTheme}
                  onBoardThemeChange={updateBoardTheme}
                />
              </div>
            </div>

            <Separator />

            {/* White Player */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-game-player-white rounded-full border-2 border-game-panel-border" />
                  <span className="font-semibold">White</span>
                </div>
                <div className={cn(
                  "font-mono text-lg px-2 py-1 rounded border",
                  gameState.timeControl.white < 60 ? "bg-game-timer-danger text-white" :
                  gameState.timeControl.white < 300 ? "bg-game-timer-warning text-white" :
                  "bg-muted"
                )}>
                  {formatTime(gameState.timeControl.white)}
                </div>
              </div>
              <div className="min-h-[60px] p-2 bg-muted rounded border">
                <div className="text-sm text-muted-foreground mb-1">Captured:</div>
                <div className="flex flex-wrap gap-1">
                  {gameState.capturedPieces.white.map((piece, index) => (
                    <span key={index} className="text-xl">
                      {PIECE_SYMBOLS[piece]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Center - Chess Board */}
        <div className="xl:col-span-2 flex justify-center">
          <ChessBoard
            game={gameState.game}
            onSquareClick={handleSquareClick}
            onPieceDrop={handleMove}
            selectedSquare={gameState.selectedSquare}
            legalMoves={gameState.legalMoves}
            lastMove={gameState.lastMove}
            isFlipped={gameState.isFlipped}
            className="w-full max-w-[600px]"
          />
        </div>

        {/* Right Panel - Move History */}
        <Card className="xl:col-span-1 bg-game-panel border-game-panel-border shadow-game-panel">
          <div className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Move History</span>
              <Badge variant="secondary">{gameState.gameHistory.length}</Badge>
            </h3>
            <ScrollArea className="h-[400px] xl:h-[500px]">
              <div className="space-y-1">
                {gameState.gameHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No moves yet
                  </div>
                ) : (
                  gameState.gameHistory.map((move, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhiteMove = index % 2 === 0;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50">
                        {isWhiteMove && (
                          <span className="text-xs text-muted-foreground w-6">
                            {moveNumber}.
                          </span>
                        )}
                        <div className={cn(
                          "px-2 py-1 rounded text-sm font-mono",
                          isWhiteMove ? "bg-game-player-white text-game-player-black" : "bg-game-player-black text-game-player-white"
                        )}>
                          {move}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>

      {/* Game End Dialog */}
      <GameEndDialog
        isOpen={gameState.game.isGameOver()}
        game={gameState.game}
        onNewGame={resetGame}
        onExportPGN={exportPGN}
        gameHistory={gameState.gameHistory}
      />
    </div>
  );
};