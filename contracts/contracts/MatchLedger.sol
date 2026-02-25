// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MatchLedger
 * @dev A simple ledger to store the commit hashes for Metarchy matches.
 * The game server acts as the relayer, submitting hashes for each turn.
 */
contract MatchLedger {
    // Authorized relayer address (the game server)
    address public owner;

    // Mapping of matchId => turnNumber => commitHash
    mapping(string => mapping(uint256 => bytes32)) public turnCommits;

    // Event emitted when a new turn is committed
    event TurnCommitted(string indexed matchId, uint256 indexed turnNumber, bytes32 commitHash, uint256 timestamp);

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the authorized relayer can commit turns");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Commits a hash for a specific match and turn.
     * @param matchId The unique ID of the match.
     * @param turnNumber The current turn number.
     * @param commitHash The combined hash of both players' locked moves.
     */
    function commitTurn(string calldata matchId, uint256 turnNumber, bytes32 commitHash) external onlyOwner {
        require(turnCommits[matchId][turnNumber] == bytes32(0), "Turn already committed");
        
        turnCommits[matchId][turnNumber] = commitHash;
        
        emit TurnCommitted(matchId, turnNumber, commitHash, block.timestamp);
    }

    /**
     * @dev Retrieves a commit hash for verification.
     * @param matchId The unique ID of the match.
     * @param turnNumber The turn number to retrieve.
     */
    function getCommit(string calldata matchId, uint256 turnNumber) external view returns (bytes32) {
        return turnCommits[matchId][turnNumber];
    }
}
