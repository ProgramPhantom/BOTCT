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

  // Start game from New Game Modal
  const handleStartGameFromModal = (config: {
    edition: Edition;
    playerCount: number;
    exactRoleIds: string[];
    startPhase: 'day' | 'night';
  }) => {
    setEdition(config.edition);
    setPlayerCount(config.playerCount);
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

  const handleSelectSeat = (seatId: number) => {
    setSelectedSeatId(seatId);
    setActiveRightTab('dossier');
  };

  return (
    <div className="botct-app">
      <Header
        phase={phase}
        dayNumber={dayNumber}
        onAdvancePhase={handleAdvancePhase}
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
              <span>Character </span>
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
