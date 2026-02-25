import { io, Socket } from 'socket.io-client';
import { ethers } from 'ethers';

const PORT = process.env.PORT || 4000;
const SERVER_URL = `http://localhost:${PORT}`;

console.log(`[E2E] Connecting to server at ${SERVER_URL}...`);

const p1: Socket = io(SERVER_URL);
const p2: Socket = io(SERVER_URL);

let matchId: string | null = null;
let p1Done = false;
let p2Done = false;

function generateDistributionPayload(actorSuffix: string) {
    const salt = ethers.hexlify(ethers.randomBytes(32));
    const actors = ['POLITIC', 'SCIENTIST', 'ARTIST', 'ROBOT'];
    const locations = ['UNIVERSITY', 'THEATER', 'SQUARE', 'FACTORY'];

    // Just mock some arbitrary placements with keccak256 hashes
    const placements = actors.map((actor, idx) => {
        const argument = `ROCK_${actorSuffix}`;
        const argumentHash = ethers.keccak256(ethers.toUtf8Bytes(`${argument}-${salt}`));

        return {
            actor,
            location: locations[idx],
            argumentHash,
            argument // passing raw argument for now per mvp rules
        };
    });

    return { placements, turnSalt: salt };
}

p1.on('connect', () => {
    console.log(`[P1] Connected with ID: ${p1.id}. Joining queue...`);
    p1.emit('join_queue');
});

p2.on('connect', () => {
    console.log(`[P2] Connected with ID: ${p2.id}. Joining queue...`);
    p2.emit('join_queue');
});

p1.on('match_found', (matchState) => {
    console.log(`[P1] Match found! ID: ${matchState.matchId}`);
    matchId = matchState.matchId;

    // Simulate thinking... then submit Phase 2 Placements
    setTimeout(() => {
        console.log(`[P1] Submitting commitDistribution...`);
        const payload = generateDistributionPayload("P1_ARG");
        p1.emit('commit_distribution', { matchId, ...payload });
    }, 1000);
});

p2.on('match_found', (matchState) => {
    console.log(`[P2] Match found! ID: ${matchState.matchId}`);

    // Simulate thinking... then submit Phase 2 Placements
    setTimeout(() => {
        console.log(`[P2] Submitting commitDistribution...`);
        const payload = generateDistributionPayload("P2_ARG");
        p2.emit('commit_distribution', { matchId: matchState.matchId, ...payload });
    }, 1500);
});

p1.on('match_updated', (matchState) => {
    if (matchState.currentPhase === 'BETS' && !p1Done) {
        console.log('[P1] Match successfully advanced to BETS phase! Gas Relayer should have fired.');
        p1Done = true;
        checkExit();
    }
});

p2.on('match_updated', (matchState) => {
    if (matchState.currentPhase === 'BETS' && !p2Done) {
        console.log('[P2] Match successfully advanced to BETS phase!');
        p2Done = true;
        checkExit();
    }
});

p1.on('error', (err) => console.error(`[P1] ERROR:`, err));
p2.on('error', (err) => console.error(`[P2] ERROR:`, err));

function checkExit() {
    if (p1Done && p2Done) {
        console.log('\n✅ [E2E] Full Match Loop (Phase 1 -> Phase 2 -> Gas Relayer) completed successfully!');

        // Disconnect clients and exit gracefully
        setTimeout(() => {
            p1.disconnect();
            p2.disconnect();
            process.exit(0);
        }, 3000); // Wait 3s so the console can capture the backend simulated Gas Relayer logs if tested locally
    }
}
