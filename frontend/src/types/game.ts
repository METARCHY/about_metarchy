export enum GamePhase {
    EVENT = 'EVENT',
    DISTRIBUTION = 'DISTRIBUTION',
    BETS = 'BETS',
    ACTIONS = 'ACTIONS',
    RESOLUTION = 'RESOLUTION'
}

export enum ActorType {
    POLITIC = 'POLITIC',
    SCIENTIST = 'SCIENTIST',
    ARTIST = 'ARTIST',
    ROBOT = 'ROBOT'
}

export enum LocationType {
    UNIVERSITY = 'UNIVERSITY',
    THEATER = 'THEATER',
    SQUARE = 'SQUARE',
    FACTORY = 'FACTORY',
    ENERGY_PLANT = 'ENERGY_PLANT',
    DUMP = 'DUMP'
}

export enum ArgumentType {
    ROCK = 'ROCK',
    PAPER = 'PAPER',
    SCISSORS = 'SCISSORS',
    DUMMY = 'DUMMY'
}

export enum ResourceType {
    PRODUCTION = 'PRODUCTION', // Bet Win
    ELECTRICITY = 'ELECTRICITY', // Bet Lose
    RECYCLING = 'RECYCLING' // Bet Draw
}

export enum ValueType {
    POWER = 'POWER',
    ART = 'ART',
    KNOWLEDGE = 'KNOWLEDGE',
    FAME = 'FAME'
}

export enum ActionCardType {
    CONSTRUCTION_WORK = 'CONSTRUCTION_WORK',
    RECONSTRUCTION = 'RECONSTRUCTION',
    STUDENT_PROTESTS = 'STUDENT_PROTESTS',
    SABOTAGE = 'SABOTAGE',
    CABLE_STOLEN = 'CABLE_STOLEN',
    ENVIRONMENTAL_PROTESTS = 'ENVIRONMENTAL_PROTESTS',
    RELOCATION = 'RELOCATION',
    CHANGE_VALUES = 'CHANGE_VALUES'
}

export type ArgumentQueue = [ArgumentType, ArgumentType, ArgumentType];

export interface ActorPlacement {
    actor: ActorType;
    location: LocationType;
    argument: ArgumentType;
    bet?: ResourceType; // Optional bet attached to this actor
}

export interface ConflictResult {
    location: LocationType;
    winnerId: string | 'TIE' | null; // socket ID, 'TIE', or null (unopposed)
    p1Actor?: ActorType;
    p2Actor?: ActorType;
    p1Arg?: ArgumentType;
    p2Arg?: ArgumentType;
    rewardType?: ValueType;
    rewardCount?: number;
}

export interface PlayerState {
    id: string; // Socket ID or User ID
    walletAddress?: string;

    // Hand/Board State
    actorsPlacements: ActorPlacement[];

    // Inventory
    resourceTokens: Record<ResourceType, number>;
    valueTokens: Record<ValueType, number>;
    victoryPoints: number;
    actionCards: ActionCardType[];

    // Phase locks
    hasCommittedDistribution: boolean;
    hasCommittedBets: boolean;
    hasCommittedActions: boolean;
    committedActionCards: ActionCardType[];
}

export interface MatchState {
    matchId: string;
    playerIds: string[]; // Order matters (e.g., Player 1, Player 2)
    players: Record<string, PlayerState>;

    // Time & Progression
    currentTurn: number;
    maxTurns: number;
    currentPhase: GamePhase;
    turnTimerEndTime: number; // Unix timestamp for Phase timeouts

    // Board Modifiers
    blockedLocations: LocationType[];

    // Resolution
    conflictResults: ConflictResult[];

    // Log
    eventLog: string[];
}
