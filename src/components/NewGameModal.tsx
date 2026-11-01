import React, { useState, useMemo } from 'react';
import type { Edition, CharacterRole, Team } from '../types/game';
import { PLAYER_DISTRIBUTIONS } from '../types/game';
import { allRoles, shuffle } from '../utils/gameSetup';
import { Sparkles, Users, Scroll, Check, X, Dice5, Trash2, Moon, Sun } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    edition: Edition;
    playerCount: number;
    exactRoleIds: string[];
    startPhase: 'day' | 'night';
  }) => void;
  currentEdition: Edition;
  currentPlayerCount: number;
}

// All standard roles from TB, BMR, SNV (excluding travelers)
const ALL_STANDARD_ROLES: CharacterRole[] = allRoles.filter(
  (r) => ['tb', 'bmr', 'snv'].includes(r.edition) && r.team !== 'traveler'
);

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentEdition,
  currentPlayerCount,
}) => {
  const [selectedScript, setSelectedScript] = useState<Edition>(currentEdition);
  const [startPhase, setStartPhase] = useState<'day' | 'night'>('day');
  const [randomCount, setRandomCount] = useState<number>(currentPlayerCount || 8);

  // Exact selected character IDs for the game
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(() => {
    const scriptRoles = ALL_STANDARD_ROLES.filter((r) => r.edition === currentEdition);
    const dist = PLAYER_DISTRIBUTIONS[currentPlayerCount] || PLAYER_DISTRIBUTIONS[8];
    const tf = scriptRoles.filter((r) => r.team === 'townsfolk').slice(0, dist.townsfolk);
    const out = scriptRoles.filter((r) => r.team === 'outsider').slice(0, dist.outsiders);
    const min = scriptRoles.filter((r) => r.team === 'minion').slice(0, dist.minions);
    const dem = scriptRoles.filter((r) => r.team === 'demon').slice(0, dist.demons);
    return new Set([...tf, ...out, ...min, ...dem].map((r) => r.id));
  });

  // Determine which characters are enabled for the currently selected script
  const isRoleEnabled = (role: CharacterRole): boolean => {
    if (selectedScript === 'custom') return true;
    return role.edition === selectedScript;
  };

  // Toggle character selection
  const handleToggleRole = (role: CharacterRole) => {
    if (!isRoleEnabled(role)) return; // Cannot select grayed out character

    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(role.id)) {
        next.delete(role.id);
      } else {
        next.add(role.id);
      }
      return next;
    });
  };

  // Random selection from enabled characters
  const handleRandomSelection = (targetCount: number = 8) => {
    const enabledRoles = ALL_STANDARD_ROLES.filter(isRoleEnabled);
    const dist = PLAYER_DISTRIBUTIONS[targetCount] || PLAYER_DISTRIBUTIONS[8];

    const townsfolkPool = shuffle(enabledRoles.filter((r) => r.team === 'townsfolk'));
    const outsiderPool = shuffle(enabledRoles.filter((r) => r.team === 'outsider'));
    const minionPool = shuffle(enabledRoles.filter((r) => r.team === 'minion'));
    const demonPool = shuffle(enabledRoles.filter((r) => r.team === 'demon'));

    let tfCount = dist.townsfolk;
    let outCount = dist.outsiders;

    // Check Baron
    const chosenMinions = minionPool.slice(0, dist.minions);
    const hasBaron = chosenMinions.some((m) => m.id === 'baron');
    if (hasBaron) {
      outCount = Math.min(outsiderPool.length, outCount + 2);
      tfCount = Math.max(0, tfCount - 2);
    }

    const chosenTf = townsfolkPool.slice(0, tfCount);
    const chosenOut = outsiderPool.slice(0, outCount);
    const chosenDem = demonPool.slice(0, dist.demons);

    const chosen = [...chosenTf, ...chosenOut, ...chosenMinions, ...chosenDem];
    setSelectedRoleIds(new Set(chosen.map((r) => r.id)));
  };

  // When script changes, deselect any characters that are now grayed out
  const handleScriptChange = (script: Edition) => {
    setSelectedScript(script);
    if (script !== 'custom') {
      setSelectedRoleIds((prev) => {
        const next = new Set<string>();
        prev.forEach((id) => {
          const role = ALL_STANDARD_ROLES.find((r) => r.id === id);
          if (role && role.edition === script) {
            next.add(id);
          }
        });
        // If nothing left or too few, auto-deal 8 players for this script
        if (next.size === 0) {
          const scriptRoles = ALL_STANDARD_ROLES.filter((r) => r.edition === script);
          const tf = scriptRoles.filter((r) => r.team === 'townsfolk').slice(0, 5);
          const out = scriptRoles.filter((r) => r.team === 'outsider').slice(0, 1);
          const min = scriptRoles.filter((r) => r.team === 'minion').slice(0, 1);
          const dem = scriptRoles.filter((r) => r.team === 'demon').slice(0, 1);
          return new Set([...tf, ...out, ...min, ...dem].map((r) => r.id));
        }
        return next;
      });
    }
  };

  // Grouped roles by team
  const teams: { key: Team; label: string; colorClass: string }[] = [
    { key: 'townsfolk', label: 'Townsfolk', colorClass: 'townsfolk' },
    { key: 'outsider', label: 'Outsiders', colorClass: 'outsider' },
    { key: 'minion', label: 'Minions', colorClass: 'minion' },
    { key: 'demon', label: 'Demons', colorClass: 'demon' },
  ];

  // Count active selections by team
  const selectedCounts = useMemo(() => {
    let townsfolk = 0;
    let outsiders = 0;
    let minions = 0;
    let demons = 0;

    selectedRoleIds.forEach((id) => {
      const role = ALL_STANDARD_ROLES.find((r) => r.id === id);
      if (role?.team === 'townsfolk') townsfolk++;
      else if (role?.team === 'outsider') outsiders++;
      else if (role?.team === 'minion') minions++;
      else if (role?.team === 'demon') demons++;
    });

    return {
      total: selectedRoleIds.size,
      townsfolk,
      outsiders,
      minions,
      demons,
    };
  }, [selectedRoleIds]);

  const handleConfirm = () => {
    if (selectedRoleIds.size < 5) {
      alert('Please select at least 5 characters to start a game.');
      return;
    }

    onStartGame({
      edition: selectedScript,
      playerCount: selectedRoleIds.size,
      exactRoleIds: Array.from(selectedRoleIds),
      startPhase,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="botct-modal-backdrop" onClick={onClose}>
      <div className="botct-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="botct-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/assets/icons/imp.png"
              alt="Grimoire Emblem"
              style={{ width: '32px', height: '32px' }}
            />
            <div>
              <h2 className="modal-title">New Game Setup</h2>
              <p className="modal-subtitle">
                Select script to reveal character pool, then choose exact characters for simulation
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="botct-modal-body">
          {/* 1. Script Selection Cards */}
          <div className="modal-section">
            <label className="modal-section-label">
              <Scroll size={14} /> 1. Select Script (Highlights Script Characters)
            </label>
            <div className="script-selection-grid">
              <div
                className={`script-card ${selectedScript === 'tb' ? 'active' : ''}`}
                onClick={() => handleScriptChange('tb')}
              >
                <div className="script-card-title">Trouble Brewing</div>
                <div className="script-card-badge">Base Edition</div>
                <div className="script-card-desc">
                  Highlights 22 standard TB characters. Other scripts grayed out.
                </div>
              </div>

              <div
                className={`script-card ${selectedScript === 'bmr' ? 'active' : ''}`}
                onClick={() => handleScriptChange('bmr')}
              >
                <div className="script-card-title">Bad Moon Rising</div>
                <div className="script-card-badge">Advanced</div>
                <div className="script-card-desc">
                  Highlights 25 standard BMR characters. Other scripts grayed out.
                </div>
              </div>

              <div
                className={`script-card ${selectedScript === 'snv' ? 'active' : ''}`}
                onClick={() => handleScriptChange('snv')}
              >
                <div className="script-card-title">Sects & Violets</div>
                <div className="script-card-badge">Information Chaos</div>
                <div className="script-card-desc">
                  Highlights 25 standard SNV characters. Other scripts grayed out.
                </div>
              </div>

              <div
                className={`script-card ${selectedScript === 'custom' ? 'active' : ''}`}
                onClick={() => handleScriptChange('custom')}
              >
                <div className="script-card-title">Custom Pool</div>
                <div className="script-card-badge">All 72 Characters</div>
                <div className="script-card-desc">
                  Enables all characters across editions. Select any combination!
                </div>
              </div>
            </div>
          </div>

          {/* 2. Constant Character List with Enabled/Grayed Out and Selection State */}
          <div className="modal-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <label className="modal-section-label" style={{ margin: 0 }}>
                <Users size={14} /> 2. Character Selection ({selectedCounts.total} Selected)
              </label>

              {/* Numerical input and dice trigger button */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label
                    htmlFor="random-player-count-input"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-parchment-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Players:
                  </label>
                  <input
                    id="random-player-count-input"
                    type="number"
                    min={5}
                    max={15}
                    value={randomCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setRandomCount(Math.max(5, Math.min(15, val)));
                      } else {
                        setRandomCount(8);
                      }
                    }}
                    style={{
                      width: '46px',
                      padding: '3px 4px',
                      background: 'rgba(20, 15, 12, 0.95)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '4px',
                      color: 'var(--color-gold-bright)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                    title="Specify number of players (5 to 15)"
                  />
                </div>

                <button
                  type="button"
                  className="medieval-btn"
                  style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                  onClick={() => handleRandomSelection(randomCount)}
                  title={`Randomly pick ${randomCount} valid characters from enabled script pool`}
                >
                  <Dice5 size={14} color="var(--color-gold-bright)" />
                  <span>Randomize</span>
                </button>

                <button
                  type="button"
                  className="medieval-btn"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={() => setSelectedRoleIds(new Set())}
                  title="Clear all character selections"
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Roster Container */}
            <div className="modal-roster-container">
              {teams.map((t) => {
                const teamRoles = ALL_STANDARD_ROLES.filter((r) => r.team === t.key);

                return (
                  <div key={t.key} className="roster-team-group">
                    <div className={`roster-team-label ${t.colorClass}`}>
                      <span>{t.label}</span>
                      <span style={{ opacity: 0.6 }}>
                        ({teamRoles.filter(isRoleEnabled).length} enabled)
                      </span>
                    </div>

                    <div className="roster-buttons-grid">
                      {teamRoles.map((role) => {
                        const enabled = isRoleEnabled(role);
                        const isSelected = selectedRoleIds.has(role.id);

                        return (
                          <button
                            key={role.id}
                            type="button"
                            className={`roster-char-btn ${t.colorClass} ${isSelected ? 'selected' : ''
                              } ${!enabled ? 'grayed-out' : ''}`}
                            onClick={() => handleToggleRole(role)}
                            disabled={!enabled}
                            title={
                              enabled
                                ? `${role.name} [${role.edition.toUpperCase()}]\n\n"${role.ability}"\n\n(Click to ${
                                    isSelected ? 'remove from' : 'add to'
                                  } game)`
                                : `${role.name} [${role.edition.toUpperCase()}]\n\n"${role.ability}"\n\n(Not in ${selectedScript.toUpperCase()} - Grayed out)`
                            }
                          >
                            <img
                              src={`/assets/icons/${role.id}.png`}
                              alt={role.name}
                              className="roster-char-icon"
                              style={{
                                width: '22px',
                                height: '22px',
                                minWidth: '22px',
                                maxWidth: '22px',
                                objectFit: 'contain',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/icons/imp.png';
                              }}
                            />
                            <span className="roster-char-name">{role.name}</span>

                            {isSelected && (
                              <span className="roster-check-icon">
                                <Check size={12} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Seating Count Section (Directly updated by character selection) */}
          <div className="modal-section">
            <label className="modal-section-label">
              <Users size={14} /> 3. Player Seating Count & Composition
            </label>

            {/* Seating overview */}
            <div className="distribution-readout">
              <div
                className="dist-chip"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  borderColor: 'var(--color-gold)',
                  color: 'var(--color-gold-bright)',
                  fontWeight: 'bold',
                }}
              >
                <strong>{selectedCounts.total}</strong> Total Players
              </div>
              <div className="dist-chip townsfolk">
                <strong>{selectedCounts.townsfolk}</strong> Townsfolk
              </div>
              <div className="dist-chip outsider">
                <strong>{selectedCounts.outsiders}</strong> Outsider
                {selectedCounts.outsiders !== 1 ? 's' : ''}
              </div>
              <div className="dist-chip minion">
                <strong>{selectedCounts.minions}</strong> Minion
                {selectedCounts.minions !== 1 ? 's' : ''}
              </div>
              <div className="dist-chip demon">
                <strong>{selectedCounts.demons}</strong> Demon
                {selectedCounts.demons !== 1 ? 's' : ''}
              </div>
            </div>

            {selectedCounts.total < 5 && (
              <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
                * At least 5 players are required to start a game.
              </div>
            )}
            {selectedCounts.demons === 0 && selectedCounts.total >= 5 && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                * Note: No Demon is currently selected. Townsfolk need a Demon to seek out!
              </div>
            )}
          </div>

          {/* 4. Initial Starting Phase */}
          <div className="modal-section">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-parchment)' }}>
                Initial Starting Phase:
              </span>
              <div className="phase-toggle">
                <button
                  className={`phase-btn ${startPhase === 'night' ? 'active night' : ''}`}
                  onClick={() => setStartPhase('night')}
                >
                  <Moon size={12} />
                  <span>Night 1</span>
                </button>
                <button
                  className={`phase-btn ${startPhase === 'day' ? 'active day' : ''}`}
                  onClick={() => setStartPhase('day')}
                >
                  <Sun size={12} />
                  <span>Day 1</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="botct-modal-footer">
          <button className="medieval-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="medieval-btn btn-crimson"
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            onClick={handleConfirm}
            disabled={selectedCounts.total < 5}
          >
            <Sparkles size={16} /> Deal Grimoire with {selectedCounts.total} Characters
          </button>
        </div>
      </div>
    </div>
  );
};
