import rolesData from '../data/roles.json';
import type { CharacterRole, PlayerSeat, Edition } from '../types/game';
import { PLAYER_DISTRIBUTIONS, MEDIEVAL_NAMES } from '../types/game';

export const allRoles: CharacterRole[] = rolesData as CharacterRole[];

export function getRolesByEdition(edition: Edition = 'tb'): CharacterRole[] {
  return allRoles.filter(r => r.edition === edition);
}

export function getRoleById(id: string): CharacterRole | undefined {
  return allRoles.find(r => r.id === id);
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface GeneratedGame {
  seats: PlayerSeat[];
  bluffs: CharacterRole[];
  edition: Edition;
  playerCount: number;
}

export function generateInitialGame(playerCount: number = 8, edition: Edition = 'tb'): GeneratedGame {
  const editionRoles = getRolesByEdition(edition);
  const baseDist = PLAYER_DISTRIBUTIONS[playerCount] || PLAYER_DISTRIBUTIONS[8];

  const townsfolkPool = shuffle(editionRoles.filter(r => r.team === 'townsfolk'));
  const outsiderPool = shuffle(editionRoles.filter(r => r.team === 'outsider'));
  const minionPool = shuffle(editionRoles.filter(r => r.team === 'minion'));
  const demonPool = shuffle(editionRoles.filter(r => r.team === 'demon'));

  // Select Minions first to check for Baron
  const selectedMinions = minionPool.slice(0, baseDist.minions);
  const hasBaron = selectedMinions.some(m => m.id === 'baron');

  let townsfolkCount = baseDist.townsfolk;
  let outsiderCount = baseDist.outsiders;

  if (hasBaron) {
    outsiderCount = Math.min(outsiderPool.length, outsiderCount + 2);
    townsfolkCount = Math.max(0, townsfolkCount - 2);
  }

  const selectedTownsfolk = townsfolkPool.slice(0, townsfolkCount);
  const selectedOutsiders = outsiderPool.slice(0, outsiderCount);
  const selectedDemon = demonPool.slice(0, baseDist.demons);

  const selectedRoles = [
    ...selectedTownsfolk,
    ...selectedOutsiders,
    ...selectedMinions,
    ...selectedDemon
  ];

  // Shuffled assignments to seats
  const shuffledRoles = shuffle(selectedRoles);

  // Remaining Townsfolk/Outsiders for Demon Bluffs (3 good characters not in play)
  const inPlayIds = new Set(selectedRoles.map(r => r.id));
  const availableBluffs = editionRoles.filter(
    r => (r.team === 'townsfolk' || r.team === 'outsider') && !inPlayIds.has(r.id)
  );
  const bluffs = shuffle(availableBluffs).slice(0, 3);

  const seats: PlayerSeat[] = shuffledRoles.map((role, idx) => ({
    id: idx,
    name: MEDIEVAL_NAMES[idx % MEDIEVAL_NAMES.length],
    characterId: role.id,
    isAlive: true,
    hasGhostVote: true,
    isPoisoned: false,
    isDrunk: role.id === 'drunk',
    reminders: [],
    notes: ''
  }));

  return {
    seats,
    bluffs,
    edition,
    playerCount
  };
}
