import { Server, Socket } from 'socket.io';
import { globalMatchmaker } from '../services/Matchmaker.js';
import { ActorPlacement, ActionCardType, ResourceType, ActorType } from '../types/game.js';

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join_queue', () => {
            const match = globalMatchmaker.joinQueue(socket.id);
            if (match) {
                // Determine players and join them to a room
                match.state.playerIds.forEach((playerId: string) => {
                    // Socket.io standard way to get a socket from id in v4
                    const playerSocket = io.sockets.sockets.get(playerId);
                    if (playerSocket) {
                        playerSocket.join(match.state.matchId);
                        playerSocket.emit('match_found', match.state);
                    }
                });
                console.log(`Match ${match.state.matchId} started.`);
            } else {
                socket.emit('queue_joined', { message: 'Waiting for opponent...' });
            }
        });

        socket.on('commit_distribution', (payload: { matchId: string, placements: ActorPlacement[] }) => {
            const match = globalMatchmaker.getMatch(payload.matchId);
            if (!match) return socket.emit('error', 'Match not found');

            try {
                match.commitDistribution(socket.id, payload.placements);
                io.to(payload.matchId).emit('match_updated', match.state);
            } catch (err: any) {
                socket.emit('error', err.message);
            }
        });

        socket.on('commit_bets', (payload: { matchId: string, bets: { actor: ActorType; bet: ResourceType }[] }) => {
            const match = globalMatchmaker.getMatch(payload.matchId);
            if (!match) return socket.emit('error', 'Match not found');

            try {
                match.commitBets(socket.id, payload.bets);
                io.to(payload.matchId).emit('match_updated', match.state);
            } catch (err: any) {
                socket.emit('error', err.message);
            }
        });

        socket.on('commit_actions', (payload: { matchId: string, actionCards: ActionCardType[] }) => {
            const match = globalMatchmaker.getMatch(payload.matchId);
            if (!match) return socket.emit('error', 'Match not found');

            try {
                match.commitActions(socket.id, payload.actionCards);
                // After actions, state might advance to RESOLUTION and quickly back to EVENT
                io.to(payload.matchId).emit('match_updated', match.state);
            } catch (err: any) {
                socket.emit('error', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // TODO: Logic to handle player disconnecting from queue or forfeiting a match
            // Could remove from waiting players if they were in queue
        });
    });
}
