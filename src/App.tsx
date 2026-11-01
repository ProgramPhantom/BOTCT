import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TownSquareCircle } from './components/TownSquareCircle';
import { CharacterDossier } from './components/CharacterDossier';
import { SimulationPanel } from './components/SimulationPanel';
import { NewGameModal } from './components/NewGameModal';
import { generateInitialGame } from './utils/gameSetup';
import type { Edition } from './types/game';
import { BookOpen, BrainCircuit } from 'lucide-react';

export function App() {
  const [edition, setEdition] = useState<Edition>('tb');
  const [playerCount, setPlayerCount] = useState<number>(8);
  const [phase, setPhase] = useState<'day' | 'night'>('day');
  const [dayNumber, setDayNumber] = useState<number>(1);

  // Modal state
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);

  // Right sidebar tab state
  const [activeRightTab, setActiveRightTab] = useState<'dossier' | 'simulation'>('dossier');

  // Active game state
  const [game, setGame] = useState(() => generateInitialGame(8, 'tb'));
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(0);

  // Selected player seat
  const selectedSeat = useMemo(() => {
    if (selectedSeatId === null) return null;
    return game.seats.find((s) => s.id === selectedSeatId) || null;
  }, [game.seats, selectedSeatId]);

  const [exactRoles, setExactRoles] = useState<string[] | undefined>(undefined);

  // Handle re-deal
  const handleResetGame = (
    count = playerCount,
    ed = edition,
    exact = exactRoles
  ) => {
    const newGame = generateInitialGame(count, ed, undefined, exact);
    setGame(newGame);
    setSelectedSeatId(0);
    setPhase('day');
    setDayNumber(1);
  };

  // Start game from New Game Modal
  const handleStartGameFromModal = (config: {
    edition: Edition;
    playerCount: number;
    exactRoleIds: string[];
    startPhase: 'day' | 'night';
  }) => {
    setEdition(config.edition);
    setPlayerCount(config.playerCount);
    setExactRoles(config.exactRoleIds);
    setPhase(config.startPhase);
    setDayNumber(1);

    const newGame = generateInitialGame(
      config.playerCount,
      config.edition,
      undefined,
      config.exactRoleIds
    );
    setGame(newGame);
    setSelectedSeatId(0);
  };

  // Advance game stage: Night 1 -> Day 1 -> Night 2 -> Day 2 ...
  const handleAdvancePhase = () => {
    if (phase === 'night') {
      setPhase('day');
    } else {
      setPhase('night');
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

  const handleSelectSeat = (seatId: number) => {
    setSelectedSeatId(seatId);
    setActiveRightTab('dossier');
  };

  return (
    <div className="botct-app">
      <Header
        edition={edition}
        playerCount={playerCount}
        phase={phase}
        dayNumber={dayNumber}
        onAdvancePhase={handleAdvancePhase}
        onResetGame={() => handleResetGame()}
        onOpenNewGame={() => setIsNewGameOpen(true)}
      />

      <main className="botct-main-content">
        {/* Center Arena: The Town Square Circle */}
        <section className="botct-center-stage">
          <TownSquareCircle
            seats={game.seats}
            selectedSeatId={selectedSeatId}
            onSelectSeat={handleSelectSeat}
            phase={phase}
            dayNumber={dayNumber}
            onAdvancePhase={handleAdvancePhase}
            bluffs={game.bluffs}
          />
        </section>

        {/* Right Sidebar: Tabbed Dossier & Simulation Panels */}
        <aside className="botct-sidebar-tabbed">
          <div className="sidebar-tab-nav">
            <button
              className={`sidebar-tab-btn ${activeRightTab === 'dossier' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('dossier')}
            >
              <BookOpen size={14} />
              <span>Character Dossier</span>
            </button>
            <button
              className={`sidebar-tab-btn ${activeRightTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('simulation')}
            >
              <BrainCircuit size={14} />
              <span>Deduction & Simulation</span>
            </button>
          </div>

          <div className="sidebar-tab-content">
            {activeRightTab === 'dossier' ? (
              <CharacterDossier
                seat={selectedSeat}
                onToggleAlive={handleToggleAlive}
                onToggleGhostVote={handleToggleGhostVote}
                onTogglePoison={handleTogglePoison}
                onToggleNominated={handleToggleNominated}
                onClose={() => setSelectedSeatId(null)}
              />
            ) : (
              <SimulationPanel
                seats={game.seats}
                phase={phase}
                dayNumber={dayNumber}
              />
            )}
          </div>
        </aside>
      </main>

      <footer className="botct-footer">
        <div>
          Blood on the Clocktower is a trademark of Steven Medway & The Pandemonium Institute. Assets used for simulation study.
        </div>
        <div style={{ color: 'var(--color-gold)' }}>
          Autonomous Agent Strategy & Deduction Engine
        </div>
      </footer>

      {/* New Game Setup Dialog */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartGameFromModal}
        currentEdition={edition}
        currentPlayerCount={playerCount}
      />
    </div>
  );
}

export default App;
