# Metarchy Game Specification

## Executive Summary
Metarchy is a hybrid Web2/Web3 turn-based strategy game that blends tabletop mechanics, poker-like hidden information, and Rock-Paper-Scissors dynamics. Geared towards tabletop enthusiasts, competitive gamblers, and the crypto gaming community, Metarchy uses blockchain (specifically Avalanche, but EVM-abstracted) purely as a verifiable, cheat-proof record of hidden moves. The game is highly accessible, offering an "invisible wallet" experience alongside traditional Web3 logins, making onboarding frictionless.

## Problem Statement
Traditional digital strategy games involving hidden moves or betting run on centralized servers, where players must trust the host not to manipulate the outcome or give asymmetrical advantages. Web3 games solve this but often suffer from terrible UX (requiring wallet setups and paying constant gas fees). Metarchy solves both by using a hybrid architecture: a fast Web2 server that pays gas fees and orchestrates the game, backed by a Web3 commit-reveal scheme that guarantees 100% provable fairness without ruining the player experience.

## Success Criteria
- Playable 1v1 duel matches completable within 10-15 minutes.
- Frictionless onboarding via Email/Google login (auto-generating temporary hidden wallets).
- Provably fair phase resolution via a smart contract commit-reveal architecture.
- Full "Cross-Game Synchronization" readiness (treating NFTs as pure metadata visually interpreted by the Metarchy client).

## User Personas
1. **The Tabletop Gamer:** Plays for the fun of the mechanics; doesn't care about blockchain. Enjoys the psychological warfare of Rock-Paper-Scissors.
2. **The Gambler / Competitor:** Plays for stakes. Needs 100% assurance that the game cannot be rigged by the opponent or the developers.
3. **The Web3 Degen:** Loves crypto, NFTs, and ecosystem interconnectedness. Collects skins and plays for tokenized rewards or leaderboard status.

## User Journey
1. **Onboarding:** Player navigates to the Metarchy web app. They connect via a Web3 Wallet (MetaMask, Core) OR via Google/Email (which spins up a hidden temporary wallet).
2. **Matchmaking:** Player enters a 1v1 duel lobby. The game server matches them with an opponent.
3. **Phase 1 (Commit):** Player sees the board (3 Human Locations, 3 Robot Locations). They assign their 4 Actors to locations. They commit an **Argument Queue** (a sequence of 3 RSP Arguments) for each Actor to be used in conflicts and tie-breakers. They lock their choices.
4. **Encryption & Relay:** The client encrypts the choices. The payload is sent to the Node.js server, which immediately submits the encrypted hashes to the EVM smart contract (paying the gas fee).
5. **Phase 2 (Reveal Actors):** The server signals that both players have committed. The board updates: players can now see *which* Actors are in *which* Locations, but the Arguments remain hidden.
6. **Phase 3 (Betting & Reveal Arguments):** Players see where conflicts are happening. They use Resource Tokens (Production, Recycling, Electricity) to bet on Win, Lose, or Draw. After bets are locked, the client sends the decryption keys to the server. The server verifies against the blockchain hash and reveals the complete board.
7. **Resolution:** Conflicts are resolved based on Rock-Paper-Scissors-Dummy logic using the 1st Argument. If a tie or re-roll (Electricity bet) occurs, the server instantly resolves it using the next Arguments in the Queue. Losing Actors are removed. Winning Actors generate Value Tokens for the player.
8. **Endgame:** 1 Victory Point is awarded per full set of (Knowledge + Art + Power). The player with the most Victory Points wins the match.

## Functional Requirements
### Must Have (P0)
- **Hybrid Auth:** Web3 Wallet connect + Web2 Social Login (with gasless relayer).
- **Core Game Loop:** Functioning phases (Commit -> Reveal Actors -> Bet -> Reveal All -> Resolve).
- **EVM Smart Contract:** A basic matching and commit-reveal contract deployed on Avalanche C-Chain / Fuji Testnet.
- **Relay Server:** Node.js/TypeScript backend to manage match state, timers, and submit blockchain transactions.
- **Fake 3D Isometric UI:** Browser-based interactive isometric gameboard.

### Should Have (P1)
- **NFT Skin Integration:** UI logic to read NFTs from the player's wallet and alter the visual representation of Actors/Resources based on the "Cross-Game Synchronization" standard.
- **Match Timers:** 3min, 2min, and 1min turn timers. Auto-forfeit if a player disconnects or fails to act.
- **Multiplayer Variants:** Support for 1v1v1 (threeel) and 2v2 (double duel) casual modes without betting.

### Nice to Have (P2)
- Action Cards and Event Cards (post-launch DLC).
- Mobile responsive layout / Mobile App version.

## Technical Architecture

### Data Model
- **Match Object:** `matchId`, `playerA`, `playerB`, `state` (COMMIT, BET, REFRESH), `turnTimer_endTime`.
- **Player State (In-Match):** `actorsPlacements` (Location mapping), `encryptedHash`, `resourceTokens` (Elec, Prod, Recy), `valueTokens` (Art, Know, Pow), `victoryPoints`.

### System Components
1. **Frontend (Next.js / TypeScript):** Handles isometric rendering, wallet connection, encryption/decryption of moves, and user input.
2. **Backend Server (Node.js / Express or WebSocket):** Manages real-time match state, countdown timers, and acts as the Gas Relayer for blockchain transactions.
3. **Smart Contracts (Solidity):** Very thin logic. Stores the `matchId` and the `bytes32 commitHash` submitted by the server on behalf of the players. Used purely for verification and anti-cheat proof.

### Integrations
- **Web3 Auth Provider:** e.g., Privy, Web3Auth, or explicitly managed temporary wallets for Google/Email login.
- **Avalanche RPC:** For submitting the commit transactions via the relayer account.
- **Metarchy GitHub GitBook:** For documentation and ruleset hosting.

### Security Model
- **Zero-Knowledge Gameplay:** The server never knows the player's actual hand until the reveal phase. The client encrypts the configuration, hashes it, and only the hash is stored on-chain. During the reveal, the client provides the salt/key. If the revealed data hashes to the stored blockchain hash, the move is valid.
- **Relayer Protection:** The server needs an anti-spam/rate-limiting mechanism so users cannot drain the server's gas fee wallet. Let's use basic auth and active-match validation to restrict who the server pays gas for.

## Non-Functional Requirements
- **Performance:** WebSocket latency under 100ms for match state updates.
- **Scalability:** Node.js server needs to be stateless (or use Redis) to allow scaling horizontally for many concurrent matches.
- **Simplicity:** Keep the backend footprint as small and strictly necessary as possible to minimize attack vectors.

## Out of Scope (For V1)
- Tokenizing Victory Points into actual on-chain ERC-20 assets.
- Action/Event cards DLC.
- Mobile native apps (iOS/Android).

## Open Questions for Implementation
- *Cross-Game Sync Standard:* We need to define exactly what metadata JSON structure the frontend will look for in a player's wallet to render a "Mage Hat" instead of the default Politic Actor.
- *Relayer Architecture:* Will we use an existing relayer protocol (like Biconomy/Gelato) or build a simple custom Node.js wallet signer script? (Custom script is usually cheaper and fits the "use as little as possible" requirement).
