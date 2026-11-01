import React from 'react';
import type { PlayerSeat } from '../types/game';
import { getRoleById } from '../utils/gameSetup';
import { Skull, Shield, Zap, Sparkles, Moon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CharacterDossierProps {
  seat: PlayerSeat | null;
  onToggleAlive: (seatId: number) => void;
  onToggleGhostVote: (seatId: number) => void;
  onTogglePoison: (seatId: number) => void;
  onToggleNominated: (seatId: number) => void;
  onClose: () => void;
}

// Curated strategic and logical deduction notes for Trouble Brewing characters
const STRATEGY_INSIGHTS: Record<string, { good: string; evil: string; logic: string }> = {
  washerwoman: {
    good: 'Share your 2 names early or hold for a private whisper to test claims without giving away the confirmed townsfolk to the Demon.',
    evil: 'Safe bluff for Minions. Bluffing Washerwoman lets you falsely confirm a Minion or frame an innocent Townsfolk.',
    logic: 'Disjunctive constraint: (Seat A = Role) ∨ (Seat B = Role). Intersecting with Empath or Chef reduces world states rapidly.',
  },
  librarian: {
    good: 'Revealing an Outsider pair verifies Outsider counts, exposing whether a Baron is in play (+2 Outsiders).',
    evil: 'Good bluff to mask Baron modifications or simulate outsider presence.',
    logic: 'Outsider count deduction: If Librarian sees zero outsiders but Butler claims later, one of them is poisoned or lying.',
  },
  investigator: {
    good: 'Identifies Minions. If one of your pings dies at night, the other is likely the Minion (Demon rarely kills Minions).',
    evil: 'Bluffing Investigator allows Evil to manufacture false accusations against Townsfolk.',
    logic: 'Minion identification constraint: (Seat A = Minion) ∨ (Seat B = Minion). Crucial for pinning down Poisoner/Baron.',
  },
  chef: {
    good: 'Chef numbers (0, 1, 2) bound adjacent evil pairs. Chef 0 proves no evil players sit next to each other.',
    evil: 'Chef 0 or 1 is easy to fake, but can backfire when seat placements contradict it.',
    logic: 'Global topology constraint: Counts adjacent pairs of evil seats in the circle. Eliminates huge swathes of candidate seatings.',
  },
  empath: {
    good: 'Survival gives exponential info. If living neighbors change, empath reading shifts, isolating evil neighbors.',
    evil: 'Prime target for Poisoner or early Demon kill. Evil Empath bluffs often get caught as circle shrinks.',
    logic: 'Dynamic neighbor parity constraint: Evaluates closest living clockwise and counter-clockwise neighbors.',
  },
  fortuneteller: {
    good: 'Track both picks and remember your Red Herring. Test the same player across multiple nights to deduce the Red Herring.',
    evil: 'Bluffing Fortune Teller is common for Minions or Demon to cast suspicion and fish for the Red Herring.',
    logic: 'Boolean disjunctive queries with persistent static noise (1 Demon + 1 Red Herring). Solvable in O(log N) queries.',
  },
  undertaker: {
    good: 'Knows executed players. Directly catches evil players bluffing roles or uncovers the Drunk.',
    evil: 'Must be poisoned or assassinated before key executions happen.',
    logic: 'Hard validation: Directly verifies death claims, invalidating inconsistent simulation branches.',
  },
  monk: {
    good: 'Protect confirmed powerful roles (Empath, Fortune Teller, Virgin) against Demon night kills.',
    evil: 'Demon can deduce Monk existence if a planned kill produces 0 deaths.',
    logic: 'Intervention event: Can prevent night death, signaling protection or Imp starpass.',
  },
  slayer: {
    good: 'Shoot openly during Day 1 or Day 2 on suspicious candidates. An Imp shot instantly wins the game!',
    evil: 'Demon must avoid being shot; Minions may bait the Slayer shot to waste it.',
    logic: 'Decisive predicate test: Returns True if and only if target is the Demon.',
  },
  virgin: {
    good: 'Demand that a suspected Townsfolk nominate you. If they die, both of you are 100% mathematically confirmed Good!',
    evil: 'Evil cannot afford to nominate the Virgin, as Minions/Demons will not die and thus expose themselves.',
    logic: 'Absolute ground truth anchor: First Townsfolk nominator dies instantly, creating an unshakeable proof base.',
  },
  imp: {
    good: 'Townsfolk must locate and execute the Imp. Watch for strange nominations and unprompted suicides.',
    evil: 'Kill threatening info roles. In emergencies, starpass by choosing yourself at night to transfer Imp to a Minion.',
    logic: 'Primary victory condition: Evil wins when only 2 players survive. Good wins immediately upon Imp death (unless Scarlet Woman).',
  },
  poisoner: {
    good: 'Watch for contradictory or nonsensical information from known reliable townsfolk.',
    evil: 'Poison high-impact info roles night 1 (Investigator, Empath) or protection roles later.',
    logic: 'Injects corrupt bits into the information state, turning truth values to arbitrary Storyteller whims.',
  },
  scarletwoman: {
    good: 'Be prepared for a second Demon execution if 5+ players were alive when the Imp died.',
    evil: 'Stay hidden and act like a benign Townsfolk until the Imp starpasses or is executed.',
    logic: 'State backup trigger: If Imp dies with 5+ living players, Scarlet Woman role shifts dynamically to Demon.',
  },
};

export const CharacterDossier: React.FC<CharacterDossierProps> = ({
  seat,
  onToggleAlive,
  onToggleGhostVote,
  onTogglePoison,
  onToggleNominated,
  onClose,
}) => {
  if (!seat) {
    return (
      <div className="botct-panel">
        <div className="panel-header">
          <span className="panel-title">Character Dossier</span>
        </div>
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-parchment-muted)' }}>
          <Sparkles size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <p>Select any player seat from the Town Square circle to inspect their character dossier, ability, and deduction profile.</p>
        </div>
      </div>
    );
  }

  const role = getRoleById(seat.characterId);
  const strategy = STRATEGY_INSIGHTS[seat.characterId] || {
    good: 'Coordinate information sharing with trusted neighbors.',
    evil: 'Maintain your bluff and exploit town suspicions.',
    logic: 'Contributes constraints to the overall simulation truth matrix.',
  };

  return (
    <div className="botct-panel">
      <div className="panel-header">
        <span className="panel-title">
          Seat #{seat.id + 1} Dossier
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--color-parchment-muted)', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div className="dossier-card">
        {/* Hero Banner */}
        <div className="dossier-hero">
          <img
            src={`/assets/icons/${seat.characterId}.png`}
            alt={role?.name}
            className="dossier-token-large"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/icons/imp.png';
            }}
          />
          <div className="dossier-header-info">
            <h2>{role?.name || seat.characterId}</h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.8rem', color: 'var(--color-parchment)' }}>
              Player: {seat.name}
            </div>
            <span className={`team-pill ${role?.team || 'townsfolk'}`}>
              {role?.team || 'Townsfolk'}
            </span>
          </div>
        </div>

        {/* Ability Text */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <Zap size={14} /> Official Ability
          </div>
          <p className="dossier-ability-quote">
            "{role?.ability || 'No ability text available.'}"
          </p>
        </div>

        {/* Night Instructions */}
        {(role?.firstNightReminder || role?.otherNightReminder) && (
          <div className="dossier-section">
            <div className="dossier-section-title">
              <Moon size={14} /> Grimoire Night Reminders
            </div>
            {role.firstNightReminder && (
              <div style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                <strong style={{ color: 'var(--color-gold)' }}>First Night:</strong> {role.firstNightReminder}
              </div>
            )}
            {role.otherNightReminder && (
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: 'var(--color-gold)' }}>Other Nights:</strong> {role.otherNightReminder}
              </div>
            )}
          </div>
        )}

        {/* Deduction & Strategy Insight */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <Sparkles size={14} /> Simulator Deductive Insight
          </div>
          <div className="strategy-box">
            <h4>Mathematical Constraint</h4>
            <p style={{ color: 'var(--color-parchment)', fontSize: '0.8rem' }}>{strategy.logic}</p>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem' }}>
            <p style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#93c5fd' }}>Town Strategy:</strong> {strategy.good}
            </p>
            <p>
              <strong style={{ color: '#fca5a5' }}>Evil Strategy:</strong> {strategy.evil}
            </p>
          </div>
        </div>

        {/* Interactive Storyteller Seat Controls */}
        <div className="dossier-section">
          <div className="dossier-section-title">
            <Shield size={14} /> Grimoire Seat Controls
          </div>
          <div className="seat-actions-grid">
            <button
              className={`medieval-btn ${!seat.isAlive ? 'btn-crimson' : ''}`}
              onClick={() => onToggleAlive(seat.id)}
            >
              <Skull size={13} />
              <span>{seat.isAlive ? 'Kill Player' : 'Revive Player'}</span>
            </button>

            {!seat.isAlive && (
              <button
                className={`medieval-btn ${seat.hasGhostVote ? 'btn-active' : ''}`}
                onClick={() => onToggleGhostVote(seat.id)}
              >
                <span>{seat.hasGhostVote ? 'Ghost Vote: Ready' : 'Ghost Vote: Spent'}</span>
              </button>
            )}

            <button
              className={`medieval-btn ${seat.isPoisoned ? 'btn-crimson' : ''}`}
              onClick={() => onTogglePoison(seat.id)}
            >
              <AlertTriangle size={13} />
              <span>{seat.isPoisoned ? 'Cure Poison' : 'Apply Poison'}</span>
            </button>

            <button
              className={`medieval-btn ${seat.isNominated ? 'btn-crimson' : ''}`}
              onClick={() => onToggleNominated(seat.id)}
            >
              <CheckCircle2 size={13} />
              <span>{seat.isNominated ? 'Clear Nom.' : 'Nominate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
