export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler';

export type Edition = 'tb' | 'bmr' | 'snv';

export interface CharacterRole {
  id: string;
  name: string;
  edition: Edition | string;
  team: Team;
  firstNight: number;
  firstNightReminder: string;
  otherNight: number;
  otherNightReminder: string;
  reminders: string[];
  setup: boolean;
  ability: string;
}

export interface PlayerSeat {
  id: number;
  name: string;
  characterId: string;
  isAlive: boolean;
  hasGhostVote: boolean;
  isPoisoned: boolean;
  isDrunk: boolean;
  isNominated?: boolean;
  votesAgainst?: number;
  reminders: string[];
  notes?: string;
}

export interface ScriptDistribution {
  players: number;
  townsfolk: number;
  outsiders: number;
  minions: number;
  demons: number;
}

export const PLAYER_DISTRIBUTIONS: Record<number, ScriptDistribution> = {
  5: { players: 5, townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
  6: { players: 6, townsfolk: 3, outsiders: 1, minions: 1, demons: 1 },
  7: { players: 7, townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
  8: { players: 8, townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
  9: { players: 9, townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
  10: { players: 10, townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
  11: { players: 11, townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
  12: { players: 12, townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
  13: { players: 13, townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
  14: { players: 14, townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
  15: { players: 15, townsfolk: 9, outsiders: 2, minions: 3, demons: 1 },
};

export const MEDIEVAL_NAMES = [
  'Father Thomas', 'Althea the Miller', 'Gilles the Smith', 'Elspeth',
  'Brother Mark', 'Widow Corva', 'Aldous the Cobbler', 'Bartholomew',
  'Lady Eleanor', 'Constance the Weaver', 'Roderick the Baker', 'Beatrice',
  'Godfrey the Fletcher', 'Isolde the Brewer', 'Osric the Cooper'
];
