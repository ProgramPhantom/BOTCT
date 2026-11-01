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
  const radius = 245; // Expanded radius in pixels from center for more spacing
  const centerCoord = 285; // Center of 570x570 container

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

          const tooltipTitle = viewMode === 'grimoire'
            ? `Seat #${seat.id + 1}: ${role?.name || 'Unknown'} (${role?.team || 'Townsfolk'})\n\n"${role?.ability || ''}"\n\nStatus: ${
                seat.isAlive ? 'Alive' : 'Dead (Ghost Vote ' + (seat.hasGhostVote ? 'Ready' : 'Spent') + ')'
              }${seat.isPoisoned ? ' [Poisoned]' : ''}${seat.isDrunk ? ' [Drunk]' : ''}`
            : `Seat #${seat.id + 1}: Townsperson\nStatus: ${seat.isAlive ? 'Alive' : 'Dead'}`;

          return (
            <div
              key={seat.id}
              className={`player-seat-node ${isSelected ? 'selected' : ''}`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onSelectSeat(seat.id)}
              title={tooltipTitle}
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

              {/* Basic character info hover card */}
              <div className={`seat-hover-card ${y < 130 ? 'pos-bottom' : 'pos-top'}`}>
                <div className="seat-hover-header">
                  <span className="seat-hover-num">Seat #{seat.id + 1}</span>
                  {viewMode === 'grimoire' && role && (
                    <span className={`team-pill ${role.team}`}>{role.team}</span>
                  )}
                </div>
                <div className="seat-hover-role-line">
                  <span className="seat-hover-rolename">
                    {viewMode === 'grimoire' ? role?.name || 'Unknown' : 'Townsperson'}
                  </span>
                </div>
                {viewMode === 'grimoire' && role?.ability && (
                  <div className="seat-hover-ability">"{role.ability}"</div>
                )}
                <div className="seat-hover-status">
                  <span style={{ color: seat.isAlive ? '#86efac' : '#f87171' }}>
                    {seat.isAlive
                      ? '● Alive'
                      : `† Dead (Ghost Vote ${seat.hasGhostVote ? 'Ready' : 'Spent'})`}
                  </span>
                  {viewMode === 'grimoire' && seat.isPoisoned && (
                    <span style={{ color: '#4ade80' }}> • Poisoned</span>
                  )}
                  {viewMode === 'grimoire' && seat.isDrunk && (
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
