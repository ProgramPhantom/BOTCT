import React from 'react';
import { Moon, Sun, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import type { Edition } from '../types/game';

interface HeaderProps {
  edition: Edition;
  playerCount: number;
  phase: 'day' | 'night';
  dayNumber: number;
  onAdvancePhase: () => void;
  onResetGame: () => void;
  onOpenNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  edition,
  playerCount,
  phase,
  dayNumber,
  onAdvancePhase,
  onResetGame,
  onOpenNewGame,
}) => {
  const getEditionName = (ed: Edition) => {
    switch (ed) {
      case 'tb':
        return 'Trouble Brewing';
      case 'bmr':
        return 'Bad Moon Rising';
      case 'snv':
        return 'Sects & Violets';
      case 'custom':
        return 'Custom Script';
      default:
        return 'Standard Script';
    }
  };

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

        {/* Current Game Details Pill */}
        <div className="medieval-badge" title="Active Game Configuration">
          <span style={{ color: 'var(--color-gold-bright)', fontWeight: 600 }}>
            {getEditionName(edition)}
          </span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{playerCount} Players</span>
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

          {/* Re-deal seats with current config */}
          <button
            className="medieval-btn"
            onClick={onResetGame}
            title="Re-shuffle and re-deal roles"
          >
            <RefreshCw size={13} />
            <span>Re-deal</span>
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
