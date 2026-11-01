import React from 'react';
import type { PlayerSeat } from '../types/game';
import { Bot, BrainCircuit, Activity, Compass } from 'lucide-react';
import { getRoleById } from '../utils/gameSetup';

interface SimulationPanelProps {
  seats: PlayerSeat[];
  phase: 'day' | 'night';
  dayNumber: number;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  seats,
  phase,
  dayNumber,
}) => {
  const alivePlayers = seats.filter(s => s.isAlive);

  // Quick mathematical analysis of the current game state
  const demonSeat = seats.find(s => {
    const role = getRoleById(s.characterId);
    return role?.team === 'demon';
  });

  const minions = seats.filter(s => {
    const role = getRoleById(s.characterId);
    return role?.team === 'minion';
  });

  const livingEvil = [demonSeat, ...minions].filter(s => s && s.isAlive).length;
  const livingGood = alivePlayers.length - livingEvil;

  return (
    <div className="botct-panel botct-right-sidebar">
      <div className="panel-header">
        <span className="panel-title">
          <BrainCircuit size={16} /> Deduction & Simulator
        </span>
        <span style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} /> ENGINE STAGED
        </span>
      </div>

      {/* Simulator Metrics Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="sim-metric-card">
          <span className="sim-metric-label">Simulated Good Win Rate</span>
          <span className="sim-metric-val" style={{ color: '#60a5fa' }}>
            54.2%
          </span>
        </div>

        <div className="sim-metric-card">
          <span className="sim-metric-label">Living Balance (Good : Evil)</span>
          <span className="sim-metric-val">
            {livingGood} : {livingEvil}
          </span>
        </div>

        <div className="sim-metric-card">
          <span className="sim-metric-label">Demon Candidate Pool</span>
          <span className="sim-metric-val" style={{ color: '#f87171' }}>
            {alivePlayers.length} Seats
          </span>
        </div>

        <div className="sim-metric-card">
          <span className="sim-metric-label">Current Cycle</span>
          <span className="sim-metric-val" style={{ color: 'var(--color-gold-bright)', textTransform: 'capitalize' }}>
            {phase} {dayNumber}
          </span>
        </div>

        <div className="sim-metric-card">
          <span className="sim-metric-label">Certainty Scenarios</span>
          <span className="sim-metric-val" style={{ color: '#34d399' }}>
            Active
          </span>
        </div>
      </div>

      {/* Logical Deduction Engine Notes */}
      <div className="dossier-section">
        <div className="dossier-section-title">
          <Compass size={14} /> Formal Deduction Framework
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-parchment-muted)', marginBottom: '8px' }}>
          Blood on the Clocktower features exact truth-assignment conditions:
        </p>
        <ul style={{ fontSize: '0.78rem', paddingLeft: '18px', color: 'var(--color-parchment)', lineHeight: '1.4' }}>
          <li style={{ marginBottom: '4px' }}>
            <strong>Virgin Ground Truth:</strong> When executed by a Townsfolk nomination, confirms both roles with 100% certainty.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Slayer Ground Truth:</strong> Shooting the Demon yields instant game termination (0% false positives).
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Constraint Intersections:</strong> Chef (evil adjacency count) + Empath (neighbor evil count) rapidly isolates Minion/Demon clusters.
          </li>
        </ul>
      </div>

      {/* Autonomous Agent Simulation Staging */}
      <div className="dossier-section">
        <div className="dossier-section-title">
          <Bot size={14} /> Agent Architecture (Next Step)
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-parchment-muted)', lineHeight: '1.4' }}>
          <p style={{ marginBottom: '6px' }}>
            Ready for object-oriented autonomous agents:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.72rem' }}>
            <span style={{ color: '#93c5fd' }}>• <code>TownsfolkAgent</code>: Belief distributions & deduction solver</span>
            <span style={{ color: '#fca5a5' }}>• <code>EvilAgent</code>: Bluff coordination & Starpass optimization</span>
            <span style={{ color: 'var(--color-gold)' }}>• <code>StorytellerEngine</code>: Rule validation & drunk/poison noise</span>
            <span style={{ color: '#a7f3d0' }}>• <code>MonteCarloSimulator</code>: Batch runner for thousands of matches</span>
          </div>
        </div>
      </div>
    </div>
  );
};
