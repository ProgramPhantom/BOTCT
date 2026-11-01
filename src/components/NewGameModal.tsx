import React, { useState } from 'react';
import type { Edition } from '../types/game';
import { PLAYER_DISTRIBUTIONS } from '../types/game';
import { allRoles, getRolesByEdition } from '../utils/gameSetup';
import { Sparkles, Users, Scroll, Check, X, Sliders } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    edition: Edition;
    playerCount: number;
    customRoleIds?: string[];
    startPhase: 'day' | 'night';
  }) => void;
  currentEdition: Edition;
  currentPlayerCount: number;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentEdition,
  currentPlayerCount,
}) => {
  const [selectedEdition, setSelectedEdition] = useState<Edition>(currentEdition);
  const [playerCount, setPlayerCount] = useState<number>(currentPlayerCount);
  const [startPhase, setStartPhase] = useState<'day' | 'night'>('day');

  // Custom script character selection
  const [customRoleIds, setCustomRoleIds] = useState<Set<string>>(() => {
    // Default custom roles to Trouble Brewing
    return new Set(getRolesByEdition('tb').map((r) => r.id));
  });

  if (!isOpen) return null;

  const dist = PLAYER_DISTRIBUTIONS[playerCount] || PLAYER_DISTRIBUTIONS[8];

  const handleToggleCustomRole = (roleId: string) => {
    setCustomRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleSelectTbPreset = () => {
    setCustomRoleIds(new Set(getRolesByEdition('tb').map((r) => r.id)));
  };

  const handleClearAllCustom = () => {
    setCustomRoleIds(new Set());
  };

  const handleConfirm = () => {
    onStartGame({
      edition: selectedEdition,
      playerCount,
      customRoleIds: selectedEdition === 'custom' ? Array.from(customRoleIds) : undefined,
      startPhase,
    });
    onClose();
  };

  return (
    <div className="botct-modal-backdrop" onClick={onClose}>
      <div className="botct-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="botct-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/assets/icons/imp.png" alt="Grimoire Emblem" style={{ width: '32px', height: '32px' }} />
            <div>
              <h2 className="modal-title">New Game Setup</h2>
              <p className="modal-subtitle">Configure Grimoire script, seating, and deduction environment</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="botct-modal-body">
          {/* Script Selection */}
          <div className="modal-section">
            <label className="modal-section-label">
              <Scroll size={14} /> 1. Select Game Script
            </label>
            <div className="script-selection-grid">
              <div
                className={`script-card ${selectedEdition === 'tb' ? 'active' : ''}`}
                onClick={() => setSelectedEdition('tb')}
              >
                <div className="script-card-title">Trouble Brewing</div>
                <div className="script-card-badge">Base Edition</div>
                <div className="script-card-desc">
                  Classic balanced deduction. Ideal benchmark for Townsfolk vs Evil strategy analysis.
                </div>
              </div>

              <div
                className={`script-card ${selectedEdition === 'bmr' ? 'active' : ''}`}
                onClick={() => setSelectedEdition('bmr')}
              >
                <div className="script-card-title">Bad Moon Rising</div>
                <div className="script-card-badge">Advanced</div>
                <div className="script-card-desc">
                  High death counts, resurrection, and mystery kills. Focus on timing and survival.
                </div>
              </div>

              <div
                className={`script-card ${selectedEdition === 'snv' ? 'active' : ''}`}
                onClick={() => setSelectedEdition('snv')}
              >
                <div className="script-card-title">Sects & Violets</div>
                <div className="script-card-badge">Information Chaos</div>
                <div className="script-card-desc">
                  Heavy information manipulation, madness mechanics, and changing alignments.
                </div>
              </div>

              <div
                className={`script-card ${selectedEdition === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedEdition('custom')}
              >
                <div className="script-card-title">Custom Script</div>
                <div className="script-card-badge">Custom Pool</div>
                <div className="script-card-desc">
                  Handpick characters across editions to test specific deduction and bluff scenarios.
                </div>
              </div>
            </div>
          </div>

          {/* Custom Script Character Selector (if custom chosen) */}
          {selectedEdition === 'custom' && (
            <div className="modal-section custom-picker-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="modal-section-label" style={{ margin: 0 }}>
                  <Sliders size={14} /> Custom Roster Selection ({customRoleIds.size} selected)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="medieval-btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={handleSelectTbPreset}>
                    Load Trouble Brewing
                  </button>
                  <button className="medieval-btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={handleClearAllCustom}>
                    Clear
                  </button>
                </div>
              </div>

              <div className="custom-roles-grid">
                {allRoles.slice(0, 40).map((role) => {
                  const isChecked = customRoleIds.has(role.id);
                  return (
                    <div
                      key={role.id}
                      className={`custom-role-chip ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleCustomRole(role.id)}
                    >
                      <img src={`/assets/icons/${role.id}.png`} alt={role.name} style={{ width: '20px', height: '20px' }} />
                      <span style={{ fontSize: '0.75rem' }}>{role.name}</span>
                      {isChecked && <Check size={12} color="#ffd700" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seating & Player Count */}
          <div className="modal-section">
            <label className="modal-section-label">
              <Users size={14} /> 2. Player Count & Town Composition
            </label>
            <div className="player-count-buttons">
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((cnt) => (
                <button
                  key={cnt}
                  className={`player-cnt-btn ${playerCount === cnt ? 'active' : ''}`}
                  onClick={() => setPlayerCount(cnt)}
                >
                  {cnt}
                </button>
              ))}
            </div>

            {/* Distribution breakdown */}
            <div className="distribution-readout">
              <div className="dist-chip townsfolk">
                <strong>{dist.townsfolk}</strong> Townsfolk
              </div>
              <div className="dist-chip outsider">
                <strong>{dist.outsiders}</strong> Outsider{dist.outsiders !== 1 ? 's' : ''}
              </div>
              <div className="dist-chip minion">
                <strong>{dist.minions}</strong> Minion{dist.minions !== 1 ? 's' : ''}
              </div>
              <div className="dist-chip demon">
                <strong>{dist.demons}</strong> Demon
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-parchment-muted)', marginTop: '4px' }}>
              * If the Baron is in play, the setup automatically adjusts to +2 Outsiders and -2 Townsfolk.
            </div>
          </div>

          {/* Starting Phase & Details */}
          <div className="modal-section">
            <label className="modal-section-label">
              <Sparkles size={14} /> 3. Additional Game Options
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-parchment)' }}>Initial Starting Phase:</span>
              <div className="phase-toggle">
                <button
                  className={`phase-btn ${startPhase === 'night' ? 'active night' : ''}`}
                  onClick={() => setStartPhase('night')}
                >
                  Night 1 (Night Info)
                </button>
                <button
                  className={`phase-btn ${startPhase === 'day' ? 'active day' : ''}`}
                  onClick={() => setStartPhase('day')}
                >
                  Day 1 (Public Town)
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
          <button className="medieval-btn btn-crimson" style={{ padding: '8px 20px', fontSize: '0.9rem' }} onClick={handleConfirm}>
            <Sparkles size={16} /> Deal Grimoire & Begin Game
          </button>
        </div>
      </div>
    </div>
  );
};
