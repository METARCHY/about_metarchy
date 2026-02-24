import { v4 as uuidv4 } from 'uuid';
import { Match } from '../models/Match.js';

export class Matchmaker {
    private waitingPlayers: string[] = [];
    public activeMatches: Map<string, Match> = new Map();

    public joinQueue(playerId: string): Match | null {
        if (this.waitingPlayers.includes(playerId)) {
            return null;
        }

        // Check if they are already in an active match
        for (const match of this.activeMatches.values()) {
            if (match.state.playerIds.includes(playerId)) {
                return match;
            }
        }

        this.waitingPlayers.push(playerId);
        console.log(`Player ${playerId} joined queue. Total waiting: ${this.waitingPlayers.length}`);

        if (this.waitingPlayers.length >= 2) {
            const p1 = this.waitingPlayers.shift()!;
            const p2 = this.waitingPlayers.shift()!;

            const matchId = uuidv4();
            const newMatch = new Match(matchId, p1, p2);
            this.activeMatches.set(matchId, newMatch);
            console.log(`Match ${matchId} started between ${p1} and ${p2}`);
            return newMatch;
        }

        return null;
    }

    public getMatch(matchId: string): Match | undefined {
        return this.activeMatches.get(matchId);
    }
}

export const globalMatchmaker = new Matchmaker();
