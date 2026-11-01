import React from 'react';
import { Moon, Sun, ChevronRight, Users, Vote } from 'lucide-react';
import type { PlayerSeat, CharacterRole } from '../types/game';
import { getRoleById } from '../utils/gameSetup';

interface TownSquareCircleProps {
  seats: PlayerSeat[];
  selectedSeatId: number | null;
  onSelectSeat: (seatId: number) => void;
  phase: 'day' | 'night';
  dayNumber: number;
  onAdvancePhase: () => void;
  bluffs: CharacterRole[];
}

export const TownSquareCircle: React.FC<TownSquareCircleProps> = ({
  seats,
  selectedSeatId,
  onSelectSeat,
  phase,
  dayNumber,
  onAdvancePhase,
  bluffs,
}) => {
  const playerCount = seats.length;
  const radius = 245; // Expanded radius in pixels from center for more spacing
  const centerCoord = 285; // Center of 570x570 container

  const aliveCount = seats.filter(s => s.isAlive).length;
  const votesNeeded = Math.ceil(aliveCount / 2);

  const nextPhaseLabel =
    phase === 'night' ? `Day ${dayNumber}` : `Night ${dayNumber + 1}`;

  return (
    <div className={`botct-arena-container ${phase === 'night' ? 'night-mode' : 'day-mode'}`}>
      {/* Top Left Counters: Alive & Majority */}
      <div className="arena-top-left-stats">
        <div className="stat-counter-badge" title="Living players in town">
          <Users size={13} style={{ color: 'var(--color-gold)' }} />
          <span>Alive:</span>
          <strong>{aliveCount}/{playerCount}</strong>
        </div>
        <div className="stat-counter-badge" title="Votes required to execute today">
          <Vote size={13} style={{ color: 'var(--color-gold)' }} />
          <span>Majority:</span>
          <strong>{votesNeeded}</strong>
        </div>
      </div>

      <div className="circle-wrapper">
        {/* Background Grimoire Rings */}
        <div className="circle-ring" />
        <div className="circle-ring-inner" />

        {/* Center Plaque with Game Stage Display and Next Button */}
        <div className="grimoire-center-seal">
          {/* Game Stage Display */}
          <div className={`game-stage-badge ${phase}`}>
            {phase === 'night' ? <Moon size={13} /> : <Sun size={13} />}
            <span>{phase === 'night' ? `Night ${dayNumber}` : `Day ${dayNumber}`}</span>
          </div>

          <p className="center-stage-subtext">
            {phase === 'day' ? 'Town Square Gathering' : 'Darkness Falls'}
          </p>

          {/* Next Button in Center */}
          <button
            className="medieval-btn btn-active center-next-btn"
            onClick={onAdvancePhase}
            title={`Advance to ${nextPhaseLabel}`}
          >
            <span>Next: {nextPhaseLabel}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Player Seats arranged in a circle */}
        {seats.map((seat, index) => {
          // Angle in radians (seat 0 at 12 o'clock, clockwise)
          const angle = (2 * Math.PI * index) / playerCount - Math.PI / 2;
          const x = centerCoord + radius * Math.cos(angle);
          const y = centerCoord + radius * Math.sin(angle);

          const role = getRoleById(seat.characterId);
          const isSelected = selectedSeatId === seat.id;
          const teamClass = role?.team || 'townsfolk';

          return (
            <div
              key={seat.id}
              className={`player-seat-node ${isSelected ? 'selected' : ''}`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onSelectSeat(seat.id)}
            >
              {/* Token Container: greyed out if dead */}
              <div
                className={`character-token ${teamClass} ${!seat.isAlive ? 'is-dead' : ''} ${isSelected ? 'selected' : ''
                  }`}
              >
                {/* Official Character Icon */}
                <img
                  src={`/assets/icons/${seat.characterId}.png`}
                  alt={role?.name || seat.characterId}
                  className="token-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/icons/imp.png';
                  }}
                />

                {/* Dead Vote Indicator - Active when vote is available, greyed out when lost */}
                {!seat.isAlive && (
                  <div
                    className={`dead-vote-marker ${seat.hasGhostVote ? 'ready' : 'spent'}`}
                    title={seat.hasGhostVote ? 'Dead Vote Available (1 Vote)' : 'Dead Vote Spent (No Votes)'}
                  >
                    <Vote size={12} strokeWidth={2.4} />
                  </div>
                )}

                {/* Status Reminders */}
                <div className="token-status-badges">
                  {seat.isPoisoned && (
                    <span className="status-badge poisoned" title="Poisoned by Poisoner">
                      Pois
                    </span>
                  )}
                  {seat.isDrunk && (
                    <span className="status-badge drunk" title="Is the Drunk (thinks Townsfolk)">
                      Drunk
                    </span>
                  )}
                  {seat.isNominated && (
                    <span className="status-badge nominated" title="Nominated for Execution">
                      Nom
                    </span>
                  )}
                </div>
              </div>

              {/* Character info hover card - always displays full info */}
              <div className={`seat-hover-card ${y < 130 ? 'pos-bottom' : 'pos-top'}`}>
                <div className="seat-hover-header">
                  <span className="seat-hover-num">Seat #{seat.id + 1}</span>
                  {role && <span className={`team-pill ${role.team}`}>{role.team}</span>}
                </div>
                <div className="seat-hover-role-line">
                  <span className="seat-hover-rolename">{role?.name || 'Unknown'}</span>
                </div>
                {role?.ability && (
                  <div className="seat-hover-ability">{role.ability}</div>
                )}
                <div className="seat-hover-status">
                  <span style={{ color: seat.isAlive ? '#86efac' : '#9ca3af' }}>
                    {seat.isAlive
                      ? '● Alive'
                      : `† Dead (Dead Vote ${seat.hasGhostVote ? 'Ready' : 'Spent'})`}
                  </span>
                  {seat.isPoisoned && (
                    <span style={{ color: '#4ade80' }}> • Poisoned</span>
                  )}
                  {seat.isDrunk && (
                    <span style={{ color: '#fed7aa' }}> • Drunk</span>
                  )}
                  {seat.isNominated && (
                    <span style={{ color: '#f87171' }}> • Nominated</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demon Bluffs Display - Always visible if bluffs exist */}
      {bluffs.length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.78rem',
              color: 'var(--color-parchment-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Demon & Minion Bluffs (3 Good Roles Not in Play):
          </div>
          <div className="bluffs-row" style={{ justifyContent: 'center' }}>
            {bluffs.map((bluff) => (
              <div key={bluff.id} className="bluff-token-chip" title={bluff.ability}>
                <img src={`/assets/icons/${bluff.id}.png`} alt={bluff.name} />
                <span>{bluff.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



