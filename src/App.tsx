import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TownSquareCircle } from './components/TownSquareCircle';
import { ScriptPanel } from './components/ScriptPanel';
import { CharacterDossier } from './components/CharacterDossier';
import { SimulationPanel } from './components/SimulationPanel';
import { generateInitialGame } from './utils/gameSetup';
import type { Edition, CharacterRole } from './types/game';

export function App() {
  const [edition, setEdition] = useState<Edition>('tb');
  const [playerCount, setPlayerCount] = useState<number>(8);
  const [phase, setPhase] = useState<'day' | 'night'>('day');
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grimoire' | 'townsquare'>('grimoire');

  // Active game state
  const [game, setGame] = useState(() => generateInitialGame(8, 'tb'));
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(0);

  // Set of character IDs currently in play
  const inPlayCharacterIds = useMemo(() => {
    return new Set(game.seats.map((s) => s.characterId));
  }, [game.seats]);

  // Selected player seat
  const selectedSeat = useMemo(() => {
    if (selectedSeatId === null) return null;
    return game.seats.find((s) => s.id === selectedSeatId) || null;
  }, [game.seats, selectedSeatId]);

  // Handle re-deal
  const handleResetGame = (count = playerCount, ed = edition) => {
    const newGame = generateInitialGame(count, ed);
    setGame(newGame);
    setSelectedSeatId(0);
    setPhase('day');
    setDayNumber(1);
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    handleResetGame(count, edition);
  };

  const handleEditionChange = (ed: Edition) => {
    setEdition(ed);
    handleResetGame(playerCount, ed);
  };

  // Phase toggling
  const handlePhaseToggle = () => {
    if (phase === 'day') {
      setPhase('night');
    } else {
      setPhase('day');
      setDayNumber((prev) => prev + 1);
    }
  };

  // Seat state manipulations
  const handleToggleAlive = (seatId: number) => {
    setGame((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.id === seatId
          ? {
              ...s,
              isAlive: !s.isAlive,
              hasGhostVote: !s.isAlive ? true : s.hasGhostVote,
            }
          : s
      ),
    }));
  };

  const handleToggleGhostVote = (seatId: number) => {
    setGame((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.id === seatId ? { ...s, hasGhostVote: !s.hasGhostVote } : s
      ),
    }));
  };

  const handleTogglePoison = (seatId: number) => {
    setGame((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.id === seatId ? { ...s, isPoisoned: !s.isPoisoned } : s
      ),
    }));
  };

  const handleToggleNominated = (seatId: number) => {
    setGame((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.id === seatId ? { ...s, isNominated: !s.isNominated } : s
      ),
    }));
  };

  const handleSelectRoleFromScript = (role: CharacterRole) => {
    // If a seat with this role is in play, select it
    const matchingSeat = game.seats.find((s) => s.characterId === role.id);
    if (matchingSeat) {
      setSelectedSeatId(matchingSeat.id);
    }
  };

  return (
    <div className="botct-app">
      <Header
        edition={edition}
        onEditionChange={handleEditionChange}
        playerCount={playerCount}
        onPlayerCountChange={handlePlayerCountChange}
        phase={phase}
        dayNumber={dayNumber}
        onPhaseToggle={handlePhaseToggle}
        viewMode={viewMode}
        onViewModeToggle={() =>
          setViewMode((m) => (m === 'grimoire' ? 'townsquare' : 'grimoire'))
        }
        onResetGame={() => handleResetGame()}
      />

      <main className="botct-main-content">
        {/* Left: Trouble Brewing Script Roster */}
        <aside>
          <ScriptPanel
            edition={edition}
            inPlayCharacterIds={inPlayCharacterIds}
            onSelectRole={handleSelectRoleFromScript}
          />
        </aside>

        {/* Center: The Town Square Circle */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TownSquareCircle
            seats={game.seats}
            selectedSeatId={selectedSeatId}
            onSelectSeat={(id) => setSelectedSeatId(id)}
            viewMode={viewMode}
            phase={phase}
            dayNumber={dayNumber}
            onAdvancePhase={handlePhaseToggle}
            bluffs={game.bluffs}
          />
        </section>

        {/* Right: Character Dossier & Simulation Telemetry */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CharacterDossier
            seat={selectedSeat}
            onToggleAlive={handleToggleAlive}
            onToggleGhostVote={handleToggleGhostVote}
            onTogglePoison={handleTogglePoison}
            onToggleNominated={handleToggleNominated}
            onClose={() => setSelectedSeatId(null)}
          />

          <SimulationPanel
            seats={game.seats}
            phase={phase}
            dayNumber={dayNumber}
          />
        </aside>
      </main>

      <footer className="botct-footer">
        <div>
          Blood on the Clocktower is a trademark of Steven Medway & The Pandemonium Institute. Assets used for simulation study.
        </div>
        <div style={{ color: 'var(--color-gold)' }}>
          Simulation Engine: Ready for Agent Class Hierarchy
        </div>
      </footer>
    </div>
  );
}

export default App;
