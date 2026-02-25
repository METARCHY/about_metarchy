import { v4 as uuidv4 } from 'uuid';
import { MatchState, PlayerState, GamePhase, ActorType, LocationType, ResourceType, ValueType, ActionCardType, ActorPlacement, ArgumentType, ConflictResult } from '../types/game.js';
import { globalGasRelayer } from '../services/GasRelayer.js';
import { prisma } from '../lib/prisma.js';
import { ethers } from 'ethers';

export function createInitialPlayerState(id: string, address?: string): PlayerState {
    return {
        id,
        walletAddress: address,
        actorsPlacements: [],
        resourceTokens: {
            [ResourceType.PRODUCTION]: 3,
            [ResourceType.ELECTRICITY]: 3,
            [ResourceType.RECYCLING]: 3
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
            conflictResults: [],
            eventLog: [`Match ${matchId} started. Turn 1 Distribution phase begins.`]
        };

        // Seed dummy players and Match for the Prisma history pipeline
        Promise.all([
            prisma.player.upsert({
                where: { walletAddress: player1Id },
                update: {},
                create: { walletAddress: player1Id, privyDid: player1Id }
            }),
            prisma.player.upsert({
                where: { walletAddress: player2Id },
                update: {},
                create: { walletAddress: player2Id, privyDid: player2Id }
            })
        ]).then(([p1, p2]) => {
            return prisma.match.create({
                data: {
                    id: matchId,
                    status: "ACTIVE",
                    player1Id: p1.id,
                    player2Id: p2.id
                }
            });
        }).catch(err => console.error("🚨 [Prisma DB Error] Match Init Failed:", err));
    }

    // Phase 2: Distribution Commit
    public commitDistribution(playerId: string, actorsPlacements: ActorPlacement[], turnSalt?: string) {
        if (this.state.currentPhase !== GamePhase.DISTRIBUTION) {
            throw new Error("Cannot commit distribution outside of Distribution phase.");
        }
        const player = this.state.players[playerId];
        if (!player) throw new Error("Player not found in match.");
        if (player.hasCommittedDistribution) throw new Error("Player already committed.");

        if (actorsPlacements.length !== 4) throw new Error("Must place exactly 4 actors.");

        player.actorsPlacements = actorsPlacements;
        if (turnSalt) {
            player.turnSalt = turnSalt;
        }
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
            const placement = player.actorsPlacements.find((p: ActorPlacement) => p.actor === b.actor);
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

    public forceAdvancePhase() {
        if (this.state.currentPhase === GamePhase.DISTRIBUTION) {
            this.advanceToPhase(GamePhase.BETS);
        } else if (this.state.currentPhase === GamePhase.BETS) {
            this.advanceToPhase(GamePhase.ACTIONS);
        } else if (this.state.currentPhase === GamePhase.ACTIONS) {
            this.resolveConflictPhase();
        } else if (this.state.currentPhase === GamePhase.RESOLUTION) {
            this.advanceTurn();
        }
        this.log(`DEV FORCED phase advance from ${this.state.currentPhase}`);
    }

    private checkPhaseAdvance() {
        const allPlayers = Object.values(this.state.players) as PlayerState[];
        if (this.state.currentPhase === GamePhase.DISTRIBUTION) {
            if (allPlayers.every(p => p.hasCommittedDistribution)) {

                // Construct the combined hash representations from the Actors
                const p1Hash = allPlayers[0].actorsPlacements.map(p => p.argumentHash || '').join('');
                const p2Hash = allPlayers[1].actorsPlacements.map(p => p.argumentHash || '').join('');

                // Safely submit the aggregated cheat-proof sequence to Avalanche
                globalGasRelayer.commitTurnHash(this.state.matchId, this.state.currentTurn, p1Hash, p2Hash).catch(err => {
                    this.log(`GasRelayer execution failed: ${err.message}`);
                });

                // Take a permanent snapshot of the current state and Avalanche hashes into the database
                const unifiedHash = ethers.keccak256(
                    ethers.AbiCoder.defaultAbiCoder().encode(['string', 'string'], [p1Hash, p2Hash])
                );

                prisma.turn.create({
                    data: {
                        matchId: this.state.matchId,
                        turnNumber: this.state.currentTurn,
                        commitHash: unifiedHash,
                        stateSnapshot: JSON.stringify(this.state)
                    }
                }).catch((err: any) => {
                    console.error(`🚨 [Prisma DB Error] State Snapshot failed:`, err);
                });

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

        const p1Id = this.state.playerIds[0];
        const p2Id = this.state.playerIds[1];
        const p1 = this.state.players[p1Id];
        const p2 = this.state.players[p2Id];

        this.state.conflictResults = [];

        // 1. Group Placements by Location
        const locationsToEvaluate = new Set<LocationType>();
        const p1ByLoc: Partial<Record<LocationType, ActorPlacement[]>> = {};
        const p2ByLoc: Partial<Record<LocationType, ActorPlacement[]>> = {};

        p1.actorsPlacements.forEach(p => {
            if (!p1ByLoc[p.location]) p1ByLoc[p.location] = [];
            p1ByLoc[p.location]!.push(p);
            locationsToEvaluate.add(p.location);
        });

        p2.actorsPlacements.forEach(p => {
            if (!p2ByLoc[p.location]) p2ByLoc[p.location] = [];
            p2ByLoc[p.location]!.push(p);
            locationsToEvaluate.add(p.location);
        });

        // Helper Map to assign Value Tokens based on winning a location
        const locationRewards: Record<LocationType, ValueType> = {
            [LocationType.UNIVERSITY]: ValueType.KNOWLEDGE,
            [LocationType.THEATER]: ValueType.ART,
            [LocationType.SQUARE]: ValueType.FAME,
            [LocationType.FACTORY]: ValueType.POWER,
            [LocationType.ENERGY_PLANT]: ValueType.POWER,
            [LocationType.DUMP]: ValueType.POWER
        };

        // 2. Evaluate each Location
        for (const loc of Array.from(locationsToEvaluate)) {
            const p1Actors = p1ByLoc[loc] || [];
            const p2Actors = p2ByLoc[loc] || [];

            // Case A: Unopposed (Player 1)
            if (p1Actors.length > 0 && p2Actors.length === 0) {
                const reward = locationRewards[loc];
                p1.valueTokens[reward] += p1Actors.length;
                this.state.conflictResults.push({
                    location: loc,
                    winnerId: p1Id,
                    p1Actor: p1Actors[0].actor,
                    p1Arg: p1Actors[0].argument,
                    rewardType: reward,
                    rewardCount: p1Actors.length
                });
                this.log(`Player A (${p1Id.substring(0, 4)}) captured ${loc} unopposed. Gained ${p1Actors.length} ${reward}.`);
                continue;
            }

            // Case B: Unopposed (Player 2)
            if (p2Actors.length > 0 && p1Actors.length === 0) {
                const reward = locationRewards[loc];
                p2.valueTokens[reward] += p2Actors.length;
                this.state.conflictResults.push({
                    location: loc,
                    winnerId: p2Id,
                    p2Actor: p2Actors[0].actor,
                    p2Arg: p2Actors[0].argument,
                    rewardType: reward,
                    rewardCount: p2Actors.length
                });
                this.log(`Player B (${p2Id.substring(0, 4)}) captured ${loc} unopposed. Gained ${p2Actors.length} ${reward}.`);
                continue;
            }

            // Case C: Conflict! (For MVP, we just match the first actor vs the first actor)
            const p1Arg = p1Actors[0].argument;
            const p2Arg = p2Actors[0].argument;

            this.log(`Conflict at ${loc}! P1 [${p1Arg}] vs P2 [${p2Arg}]`);

            // RPS Logic
            let winner: string | null = null;
            if (p1Arg === p2Arg) {
                winner = "TIE";
            } else if (p1Arg === ArgumentType.DUMMY) {
                winner = p2Id; // Dummy always loses
            } else if (p2Arg === ArgumentType.DUMMY) {
                winner = p1Id;
            } else if (
                (p1Arg === ArgumentType.ROCK && p2Arg === ArgumentType.SCISSORS) ||
                (p1Arg === ArgumentType.PAPER && p2Arg === ArgumentType.ROCK) ||
                (p1Arg === ArgumentType.SCISSORS && p2Arg === ArgumentType.PAPER)
            ) {
                winner = p1Id;
            } else {
                winner = p2Id;
            }

            if (winner === "TIE") {
                this.state.conflictResults.push({
                    location: loc,
                    winnerId: "TIE",
                    p1Actor: p1Actors[0].actor,
                    p2Actor: p2Actors[0].actor,
                    p1Arg: p1Arg,
                    p2Arg: p2Arg
                });
                this.log(`--> It's a Tie! Both arguments destroyed. No reward.`);
            } else if (winner === p1Id) {
                const reward = locationRewards[loc];
                p1.valueTokens[reward] += 1;
                this.state.conflictResults.push({
                    location: loc,
                    winnerId: p1Id,
                    p1Actor: p1Actors[0].actor,
                    p2Actor: p2Actors[0].actor,
                    p1Arg: p1Arg,
                    p2Arg: p2Arg,
                    rewardType: reward,
                    rewardCount: 1
                });
                this.log(`--> P1 Wins! Granted 1 ${reward}.`);
            } else {
                const reward = locationRewards[loc];
                p2.valueTokens[reward] += 1;
                this.state.conflictResults.push({
                    location: loc,
                    winnerId: p2Id,
                    p1Actor: p1Actors[0].actor,
                    p2Actor: p2Actors[0].actor,
                    p1Arg: p1Arg,
                    p2Arg: p2Arg,
                    rewardType: reward,
                    rewardCount: 1
                });
                this.log(`--> P2 Wins! Granted 1 ${reward}.`);
            }
        }

        // We DO NOT auto-advance here anymore, the frontend needs time to render RESOLUTION animations.
        // The devForceAdvance will move it from RESOLUTION to EVENT.
    }

    private advanceTurn() {
        this.state.currentTurn++;
        if (this.state.currentTurn > this.state.maxTurns) {
            this.log("Game Over!");
        } else {
            (Object.values(this.state.players) as PlayerState[]).forEach(p => {
                p.hasCommittedDistribution = false;
                p.hasCommittedBets = false;
                p.hasCommittedActions = false;
                p.committedActionCards = [];
                p.actorsPlacements = []; // Reset actors back to hand
            });
            this.state.blockedLocations = [];
            this.state.conflictResults = [];
            this.advanceToPhase(GamePhase.EVENT);
        }
    }

    private log(msg: string) {
        this.state.eventLog.push(msg);
    }
}
