import React from 'react';
import { Moon, Sun, RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { Edition } from '../types/game';

interface HeaderProps {
  edition: Edition;
  onEditionChange: (edition: Edition) => void;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  phase: 'day' | 'night';
  dayNumber: number;
  onPhaseToggle: () => void;
  viewMode: 'grimoire' | 'townsquare';
  onViewModeToggle: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  edition,
  onEditionChange,
  playerCount,
  onPlayerCountChange,
  phase,
  dayNumber,
  onPhaseToggle,
  viewMode,
  onViewModeToggle,
  onResetGame,
}) => {
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
          {/* Script Selection */}
          <div className="medieval-select-group">
            <span className="medieval-select-label">Script:</span>
            <select
              className="medieval-select"
              value={edition}
              onChange={(e) => onEditionChange(e.target.value as Edition)}
            >
              <option value="tb">Trouble Brewing</option>
              <option value="bmr">Bad Moon Rising</option>
              <option value="snv">Sects & Violets</option>
            </select>
          </div>

          {/* Player Count */}
          <div className="medieval-select-group">
            <span className="medieval-select-label">Townsfolk:</span>
            <select
              className="medieval-select"
              value={playerCount}
              onChange={(e) => onPlayerCountChange(Number(e.target.value))}
            >
              {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} Players
                </option>
              ))}
            </select>
          </div>

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
            <span>{viewMode === 'grimoire' ? 'Storyteller Grimoire' : 'Town Square'}</span>
          </button>

          {/* Reset / Re-deal */}
          <button
            className="medieval-btn btn-crimson"
            onClick={onResetGame}
            title="Randomize and deal a new game configuration"
          >
            <RefreshCw size={14} />
            <span>Re-deal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
