import {
    MatchState, PlayerState, GamePhase, ActorType, LocationType,
    ResourceType, ValueType, ActionCardType, ActorPlacement, ArgumentType
} from '../types/game';

export function createInitialPlayerState(id: string, address?: string): PlayerState {
    return {
        id,
        walletAddress: address,
        actorsPlacements: [],
        resourceTokens: {
            [ResourceType.PRODUCTION]: 0,
            [ResourceType.ELECTRICITY]: 0,
            [ResourceType.RECYCLING]: 0
        },
        valueTokens: {
            [ValueType.POWER]: 0,
            [ValueType.ART]: 0,
            [ValueType.KNOWLEDGE]: 0,
            [ValueType.FAME]: 0
        },
        victoryPoints: 0,
        actionCards: [],
        hasCommittedDistribution: false,
        hasCommittedBets: false,
        hasCommittedActions: false,
        committedActionCards: []
    };
}

export class Match {
    public state: MatchState;

    constructor(matchId: string, player1Id: string, player2Id: string) {
        this.state = {
            matchId,
            playerIds: [player1Id, player2Id],
            players: {
                [player1Id]: createInitialPlayerState(player1Id),
                [player2Id]: createInitialPlayerState(player2Id)
            },
            currentTurn: 1,
            maxTurns: 7, // Default for 2 players
            currentPhase: GamePhase.DISTRIBUTION, // Turn 1 skips Event Phase
            turnTimerEndTime: Date.now() + 120000,
            blockedLocations: [],
            eventLog: [`Match ${matchId} started. Turn 1 Distribution phase begins.`]
        };
    }

    // Phase 2: Distribution Commit
    public commitDistribution(playerId: string, actorsPlacements: ActorPlacement[]) {
        if (this.state.currentPhase !== GamePhase.DISTRIBUTION) {
            throw new Error("Cannot commit distribution outside of Distribution phase.");
        }
        const player = this.state.players[playerId];
        if (!player) throw new Error("Player not found in match.");
        if (player.hasCommittedDistribution) throw new Error("Player already committed.");

        if (actorsPlacements.length !== 4) throw new Error("Must place exactly 4 actors.");

        player.actorsPlacements = actorsPlacements;
        player.hasCommittedDistribution = true;

        this.log(`Player ${playerId} committed distribution.`);
        this.checkPhaseAdvance();
    }

    // Phase 3: Bets Commit
    public commitBets(playerId: string, bets: { actor: ActorType, bet: ResourceType }[]) {
        if (this.state.currentPhase !== GamePhase.BETS) throw new Error("Not in BETS phase.");
        const player = this.state.players[playerId];
        if (player.hasCommittedBets) throw new Error("Already committed bets.");

        const tempResources = { ...player.resourceTokens };
        for (const b of bets) {
            if (tempResources[b.bet] <= 0) throw new Error(`Not enough ${b.bet} tokens.`);
            tempResources[b.bet]--;
            const placement = player.actorsPlacements.find(p => p.actor === b.actor);
            if (placement) placement.bet = b.bet;
        }

        player.resourceTokens = tempResources;
        player.hasCommittedBets = true;
        this.log(`Player ${playerId} committed bets.`);
        this.checkPhaseAdvance();
    }

    // Phase 4: Actions Commit
    public commitActions(playerId: string, actionCards: ActionCardType[]) {
        if (this.state.currentPhase !== GamePhase.ACTIONS) throw new Error("Not in ACTIONS phase.");
        const player = this.state.players[playerId];
        if (player.hasCommittedActions) throw new Error("Already committed actions.");

        player.committedActionCards = actionCards;
        player.hasCommittedActions = true;
        this.log(`Player ${playerId} committed action cards.`);
        this.checkPhaseAdvance();
    }

    private checkPhaseAdvance() {
        const allPlayers = Object.values(this.state.players);
        if (this.state.currentPhase === GamePhase.DISTRIBUTION) {
            if (allPlayers.every(p => p.hasCommittedDistribution)) {
                this.advanceToPhase(GamePhase.BETS);
            }
        } else if (this.state.currentPhase === GamePhase.BETS) {
            if (allPlayers.every(p => p.hasCommittedBets)) {
                this.advanceToPhase(GamePhase.ACTIONS);
            }
        } else if (this.state.currentPhase === GamePhase.ACTIONS) {
            if (allPlayers.every(p => p.hasCommittedActions)) {
                this.resolveConflictPhase();
            }
        }
    }

    private advanceToPhase(phase: GamePhase) {
        this.state.currentPhase = phase;
        this.state.turnTimerEndTime = Date.now() + 120000;
        this.log(`Advanced to Phase: ${phase}`);
    }

    private resolveConflictPhase() {
        this.advanceToPhase(GamePhase.RESOLUTION);
        this.log("Resolving Conflicts...");

        // Future: implement Action Card priority sequences and RPS Argument Queue logic here

        // Auto advance turn for V1 MVP
        this.advanceTurn();
    }

    private advanceTurn() {
        this.state.currentTurn++;
        if (this.state.currentTurn > this.state.maxTurns) {
            this.log("Game Over!");
        } else {
            Object.values(this.state.players).forEach(p => {
                p.hasCommittedDistribution = false;
                p.hasCommittedBets = false;
                p.hasCommittedActions = false;
                p.committedActionCards = [];
                p.actorsPlacements = []; // Reset actors back to hand
            });
            this.state.blockedLocations = [];
            this.advanceToPhase(GamePhase.EVENT);
        }
    }

    private log(msg: string) {
        this.state.eventLog.push(msg);
    }
}
