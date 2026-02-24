"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { MatchState } from "@/types/game";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface SocketContextContext {
    socket: Socket | null;
    isConnected: boolean;
    matchState: MatchState | null;
    joinQueue: () => void;
    commitDistribution: (placements: any) => void;
    commitBets: (bets: any) => void;
    commitActions: (actions: any) => void;
    error: string | null;
}

const SocketContext = createContext<SocketContextContext | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [matchState, setMatchState] = useState<MatchState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });

        socketInstance.on("connect", () => {
            console.log("Connected to WebSocket Server");
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
            console.log("Disconnected from WebSocket Server");
        });

        socketInstance.on("match_found", (state: MatchState) => {
            console.log("Match Found!", state);
            setMatchState(state);
            setError(null);
        });

        socketInstance.on("match_updated", (state: MatchState) => {
            console.log("Match Updated:", state);
            setMatchState(state);
        });

        socketInstance.on("error", (msg: string) => {
            console.error("Socket Error:", msg);
            setError(msg);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const joinQueue = () => {
        if (socket) {
            socket.emit("join_queue");
        }
    };

    const commitDistribution = (placements: any) => {
        if (socket && matchState) {
            socket.emit("commit_distribution", { matchId: matchState.matchId, placements });
        }
    };

    const commitBets = (bets: any) => {
        if (socket && matchState) {
            socket.emit("commit_bets", { matchId: matchState.matchId, bets });
        }
    };

    const commitActions = (actions: any) => {
        if (socket && matchState) {
            socket.emit("commit_actions", { matchId: matchState.matchId, actionCards: actions });
        }
    };

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                matchState,
                joinQueue,
                commitDistribution,
                commitBets,
                commitActions,
                error,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
