import React from 'react';
import type { CharacterRole, Edition, Team } from '../types/game';
import { getRolesByEdition } from '../utils/gameSetup';
import { Scroll } from 'lucide-react';

interface ScriptPanelProps {
  edition: Edition;
  inPlayCharacterIds: Set<string>;
  onSelectRole: (role: CharacterRole) => void;
}

export const ScriptPanel: React.FC<ScriptPanelProps> = ({
  edition,
  inPlayCharacterIds,
  onSelectRole,
}) => {
  const roles = getRolesByEdition(edition);

  const teams: { key: Team; label: string; countLabel: string }[] = [
    { key: 'townsfolk', label: 'Townsfolk', countLabel: '13 Roles' },
    { key: 'outsider', label: 'Outsiders', countLabel: '4 Roles' },
    { key: 'minion', label: 'Minions', countLabel: '4 Roles' },
    { key: 'demon', label: 'Demons', countLabel: '1 Role' },
  ];

  return (
    <div className="botct-panel">
      <div className="panel-header">
        <span className="panel-title">
          <Scroll size={16} /> Trouble Brewing Script
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', fontFamily: 'var(--font-ui)' }}>
          {roles.length} Characters
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {teams.map((t) => {
          const teamRoles = roles.filter((r) => r.team === t.key);
          if (teamRoles.length === 0) return null;

          return (
            <div key={t.key} className="script-role-group">
              <div className={`script-group-header ${t.key}`}>
                <span>{t.label}</span>
                <span style={{ opacity: 0.7 }}>{t.countLabel}</span>
              </div>

              {teamRoles.map((role) => {
                const isInPlay = inPlayCharacterIds.has(role.id);
                return (
                  <div
                    key={role.id}
                    className={`script-role-item ${isInPlay ? 'in-play' : ''}`}
                    onClick={() => onSelectRole(role)}
                    title={role.ability}
                  >
                    <img
                      src={`/assets/icons/${role.id}.png`}
                      alt={role.name}
                      className="script-role-icon"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/icons/imp.png';
                      }}
                    />
                    <div className="script-role-text">
                      <div className="script-role-name">
                        {role.name}
                        {isInPlay && (
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '0.62rem',
                              color: 'var(--color-gold-bright)',
                              fontFamily: 'var(--font-ui)',
                            }}
                          >
                            [IN PLAY]
                          </span>
                        )}
                      </div>
                      <div className="script-role-desc">{role.ability}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
