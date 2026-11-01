import React from 'react';
import { Moon, Sun, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react';
import type { Edition } from '../types/game';

interface HeaderProps {
  edition: Edition;
  playerCount: number;
  phase: 'day' | 'night';
  dayNumber: number;
  onPhaseToggle: () => void;
  viewMode: 'grimoire' | 'townsquare';
  onViewModeToggle: () => void;
  onResetGame: () => void;
  onOpenNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  edition,
  playerCount,
  phase,
  dayNumber,
  onPhaseToggle,
  viewMode,
  onViewModeToggle,
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
          {/* Day / Night Switch */}
          <div className="phase-toggle">
            <button
              className={`phase-btn ${phase === 'night' ? 'active night' : ''}`}
              onClick={onPhaseToggle}
              title="Night Phase (Information & Evil Murders)"
            >
              <Moon size={14} />
              <span>Night {dayNumber}</span>
            </button>
            <button
              className={`phase-btn ${phase === 'day' ? 'active day' : ''}`}
              onClick={onPhaseToggle}
              title="Day Phase (Public Whisper & Execution)"
            >
              <Sun size={14} />
              <span>Day {dayNumber}</span>
            </button>
          </div>

          {/* Grimoire View vs Public Town Square View */}
          <button
            className={`medieval-btn ${viewMode === 'grimoire' ? 'btn-active' : ''}`}
            onClick={onViewModeToggle}
            title={
              viewMode === 'grimoire'
                ? 'Grimoire View (All secret roles & poison visible)'
                : 'Town Square View (Public player knowledge)'
            }
          >
            {viewMode === 'grimoire' ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>{viewMode === 'grimoire' ? 'Grimoire' : 'Town Square'}</span>
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
