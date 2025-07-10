import React from 'react';
import { Chess, Square } from 'chess.js';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  game: Chess;
  onSquareClick: (square: Square) => void;
  onPieceDrop?: (sourceSquare: Square, targetSquare: Square) => void;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  isFlipped?: boolean;
  className?: string;
}

const PIECE_UNICODE: { [key: string]: string } = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  onSquareClick,
  onPieceDrop,
  selectedSquare,
  legalMoves,
  lastMove,
  isFlipped = false,
  className
}) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getSquareColor = (file: number, rank: number): string => {
    return (file + rank) % 2 === 0 ? 'chess-dark' : 'chess-light';
  };

  const getPieceSymbol = (square: Square): string => {
    const piece = game.get(square);
    if (!piece) return '';
    return PIECE_UNICODE[piece.color + piece.type.toUpperCase()] || '';
  };

  const getSquareHighlight = (square: string): string => {
    if (selectedSquare === square) {
      return 'bg-chess-highlight';
    }
    if (lastMove && (lastMove.from === square || lastMove.to === square)) {
      return 'bg-chess-last-move/50';
    }
    if (legalMoves.includes(square)) {
      return 'before:absolute before:inset-0 before:rounded-full before:bg-chess-legal-move before:w-6 before:h-6 before:m-auto relative before:opacity-60';
    }
    if (game.isCheck()) {
      const piece = game.get(square as Square);
      if (piece?.type === 'k' && piece?.color === game.turn()) {
        return 'bg-chess-check animate-check-pulse';
      }
    }
    return '';
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      e.dataTransfer.setData('text/plain', square);
      e.dataTransfer.effectAllowed = 'move';
      onSquareClick(square as Square);
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData('text/plain');
    if (sourceSquare && sourceSquare !== targetSquare && onPieceDrop) {
      onPieceDrop(sourceSquare as Square, targetSquare as Square);
    }
  };

  const renderSquare = (file: string, rank: string) => {
    const square = file + rank;
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    const isLight = getSquareColor(fileIndex, rankIndex) === 'chess-light';
    const piece = getPieceSymbol(square as Square);
    const pieceData = game.get(square as Square);
    const canDrag = pieceData && pieceData.color === game.turn();

    return (
      <div
        key={square}
        className={cn(
          'aspect-square flex items-center justify-center cursor-pointer relative',
          'transition-all duration-200 hover:brightness-110',
          isLight ? 'bg-chess-light' : 'bg-chess-dark',
          getSquareHighlight(square),
          'select-none text-4xl md:text-5xl lg:text-6xl'
        )}
        onClick={() => onSquareClick(square as Square)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, square)}
      >
        {piece && (
          <span 
            className={cn(
              'transition-transform duration-200 hover:scale-110',
              'drop-shadow-sm filter',
              canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            )}
            draggable={canDrag}
            onDragStart={(e) => handleDragStart(e, square)}
          >
            {piece}
          </span>
        )}
        
        {/* Square coordinates */}
        {!isFlipped && fileIndex === 0 && (
          <div className="absolute bottom-1 left-1 text-xs font-bold opacity-60">
            {rank}
          </div>
        )}
        {!isFlipped && rankIndex === 7 && (
          <div className="absolute top-1 right-1 text-xs font-bold opacity-60">
            {file}
          </div>
        )}
        {isFlipped && fileIndex === 7 && (
          <div className="absolute bottom-1 left-1 text-xs font-bold opacity-60">
            {rank}
          </div>
        )}
        {isFlipped && rankIndex === 0 && (
          <div className="absolute top-1 right-1 text-xs font-bold opacity-60">
            {file}
          </div>
        )}
      </div>
    );
  };

  const boardFiles = isFlipped ? [...files].reverse() : files;
  const boardRanks = isFlipped ? [...ranks].reverse() : ranks;

  return (
    <div className={cn(
      'inline-block p-4 bg-chess-board-border rounded-lg shadow-chess-board',
      'w-full max-w-[600px] aspect-square',
      className
    )}>
      <div className="grid grid-cols-8 gap-0 w-full h-full rounded border-2 border-chess-board-border overflow-hidden">
        {boardRanks.map(rank => 
          boardFiles.map(file => renderSquare(file, rank))
        )}
      </div>
    </div>
  );
};