import React from 'react';
import { Moon, Sun, Sparkles, ChevronRight } from 'lucide-react';

interface HeaderProps {
  phase: 'day' | 'night';
  dayNumber: number;
  onAdvancePhase: () => void;
  onOpenNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  phase,
  dayNumber,
  onAdvancePhase,
  onOpenNewGame,
}) => {
  const nextPhaseLabel =
    phase === 'night' ? `Day ${dayNumber}` : `Night ${dayNumber + 1}`;

  return (
    <header className="botct-header">
      <div className="botct-header-inner">
        {/* Branding */}
        <div className="botct-branding">
          <img
            src="/assets/icons/imp.png"
            alt="Imp Crest"
            className="botct-logo-icon"
          />
          <div className="botct-title-group">
            <h1>BLOOD ON THE CLOCKTOWER</h1>
            <p>Strategy & Logical Deduction Simulator</p>
          </div>
        </div>

        {/* Controls */}
        <div className="botct-top-controls">
          {/* Game Stage Display (Day / Night, Number) */}
          <div className={`game-stage-badge ${phase}`}>
            {phase === 'night' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{phase === 'night' ? `Night ${dayNumber}` : `Day ${dayNumber}`}</span>
          </div>

          {/* Next Phase Button */}
          <button
            className="medieval-btn btn-active"
            onClick={onAdvancePhase}
            title={`Advance to ${nextPhaseLabel}`}
          >
            <span>Next: {nextPhaseLabel}</span>
            <ChevronRight size={14} />
          </button>

          {/* New Game Setup Modal Button */}
          <button
            className="medieval-btn btn-crimson"
            onClick={onOpenNewGame}
            title="Open New Game Setup Dialog"
          >
            <Sparkles size={14} />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};

