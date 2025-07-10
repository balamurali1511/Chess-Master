import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Handshake, RotateCcw, Download } from 'lucide-react';
import { Chess } from 'chess.js';

interface GameEndDialogProps {
  isOpen: boolean;
  game: Chess;
  onNewGame: () => void;
  onExportPGN: () => void;
  gameHistory: string[];
}

export const GameEndDialog: React.FC<GameEndDialogProps> = ({
  isOpen,
  game,
  onNewGame,
  onExportPGN,
  gameHistory
}) => {
  const getGameResult = () => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      return {
        title: 'Checkmate!',
        message: `${winner} wins the game!`,
        icon: <Trophy className="w-8 h-8 text-primary" />,
        variant: 'default' as const
      };
    }
    
    if (game.isStalemate()) {
      return {
        title: 'Stalemate!',
        message: 'The game is drawn by stalemate',
        icon: <Handshake className="w-8 h-8 text-muted-foreground" />,
        variant: 'secondary' as const
      };
    }
    
    if (game.isDraw()) {
      let drawReason = 'The game is drawn';
      if (game.isThreefoldRepetition()) {
        drawReason = 'Draw by threefold repetition';
      } else if (game.isInsufficientMaterial()) {
        drawReason = 'Draw by insufficient material';
      }
      
      return {
        title: 'Draw!',
        message: drawReason,
        icon: <Handshake className="w-8 h-8 text-muted-foreground" />,
        variant: 'secondary' as const
      };
    }
    
    return {
      title: 'Game Over',
      message: 'The game has ended',
      icon: <Crown className="w-8 h-8 text-muted-foreground" />,
      variant: 'secondary' as const
    };
  };

  const result = getGameResult();
  const totalMoves = gameHistory.length;
  const gameDuration = Math.floor(totalMoves / 2) + (totalMoves % 2);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-game-panel border-game-panel-border">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {result.icon}
          </div>
          <DialogTitle className="text-2xl">{result.title}</DialogTitle>
          <DialogDescription className="text-lg">
            {result.message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Game Statistics */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalMoves}</div>
              <div className="text-sm text-muted-foreground">Total Moves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{gameDuration}</div>
              <div className="text-sm text-muted-foreground">Full Moves</div>
            </div>
          </div>

          {/* Game Result Badge */}
          <div className="flex justify-center">
            <Badge variant={result.variant} className="text-lg px-6 py-2">
              {result.title}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onNewGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
            <Button
              onClick={onExportPGN}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PGN
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};