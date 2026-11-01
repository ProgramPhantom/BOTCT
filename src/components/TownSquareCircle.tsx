import React from 'react';
import type { PlayerSeat, CharacterRole } from '../types/game';
import { getRoleById } from '../utils/gameSetup';

interface TownSquareCircleProps {
  seats: PlayerSeat[];
  selectedSeatId: number | null;
  onSelectSeat: (seatId: number) => void;
  viewMode: 'grimoire' | 'townsquare';
  phase: 'day' | 'night';
  dayNumber: number;
  onAdvancePhase: () => void;
  bluffs: CharacterRole[];
}

export const TownSquareCircle: React.FC<TownSquareCircleProps> = ({
  seats,
  selectedSeatId,
  onSelectSeat,
  viewMode,
  phase,
  dayNumber,
  onAdvancePhase,
  bluffs,
}) => {
  const playerCount = seats.length;
  const radius = 230; // Radius in pixels from center
  const centerCoord = 300; // Center of 600x600 viewBox/container

  const aliveCount = seats.filter(s => s.isAlive).length;
  const votesNeeded = Math.ceil(aliveCount / 2);

  return (
    <div className={`botct-arena-container ${phase === 'night' ? 'night-mode' : 'day-mode'}`}>
      <div className="circle-wrapper">
        {/* Background Grimoire Rings */}
        <div className="circle-ring" />
        <div className="circle-ring-inner" />

        {/* Center Grimoire Seal */}
        <div className="grimoire-center-seal">
          <img
            src="/assets/icons/imp.png"
            alt="Town Square Center"
            style={{ width: '48px', height: '48px', opacity: 0.9, marginBottom: '4px' }}
          />
          <h3>{phase === 'day' ? `Day ${dayNumber}` : `Night ${dayNumber}`}</h3>
          <p>{phase === 'day' ? 'Town Square Gathering' : 'Darkness Falls'}</p>

          <div className="center-seal-stats">
            <span className="center-stat-pill" title="Living players in town">
              Alive: {aliveCount}/{playerCount}
            </span>
            <span className="center-stat-pill" title="Votes required to execute today">
              Majority: {votesNeeded}
            </span>
          </div>

          <button
            className="medieval-btn"
            style={{ marginTop: '10px', fontSize: '0.74rem', padding: '4px 10px' }}
            onClick={onAdvancePhase}
          >
            {phase === 'night' ? 'Dawn Rises (To Day)' : 'Dusk Falls (To Night)'}
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
          const isDemon = role?.team === 'demon';
          const teamClass = role?.team || 'townsfolk';

          return (
            <div
              key={seat.id}
              className={`player-seat-node ${isSelected ? 'selected' : ''}`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onSelectSeat(seat.id)}
            >
              {/* Token Container */}
              <div
                className={`character-token ${viewMode === 'grimoire' ? teamClass : ''} ${
                  isSelected ? 'selected' : ''
                }`}
              >
                {/* Official Character Icon */}
                <img
                  src={`/assets/icons/${seat.characterId}.png`}
                  alt={role?.name || seat.characterId}
                  className="token-image"
                  style={{
                    filter: !seat.isAlive
                      ? 'grayscale(80%) brightness(0.6)'
                      : viewMode === 'townsquare' && !isDemon
                      ? 'none'
                      : 'none',
                  }}
                  onError={(e) => {
                    // Fallback to placeholder if specific icon missing
                    (e.target as HTMLImageElement).src = '/assets/icons/imp.png';
                  }}
                />

                {/* Dead Shroud Overlay */}
                {!seat.isAlive && (
                  <div className="dead-shroud-overlay" title="Dead Player (Has 1 Ghost Vote)">
                    <img
                      src="/assets/death.png"
                      alt="Shroud of Death"
                      className="death-ribbon-img"
                    />
                  </div>
                )}

                {/* Ghost Vote Token for dead players */}
                {!seat.isAlive && (
                  <div
                    className={`ghost-vote-marker ${!seat.hasGhostVote ? 'spent' : ''}`}
                    title={seat.hasGhostVote ? 'Ghost Vote Available' : 'Ghost Vote Spent'}
                  >
                    {seat.hasGhostVote ? '👻' : '✕'}
                  </div>
                )}

                {/* Status Reminders */}
                <div className="token-status-badges">
                  {viewMode === 'grimoire' && seat.isPoisoned && (
                    <span className="status-badge poisoned" title="Poisoned by Poisoner">
                      Pois
                    </span>
                  )}
                  {viewMode === 'grimoire' && seat.isDrunk && (
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

              {/* Player Nameplate */}
              <div className="seat-nameplate">
                <span className="seat-player-name">
                  #{seat.id + 1} {seat.name}
                </span>
                <span className="seat-character-name">
                  {viewMode === 'grimoire' ? role?.name || 'Unknown' : 'Townsperson'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demon Bluffs Display */}
      {viewMode === 'grimoire' && bluffs.length > 0 && (
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
