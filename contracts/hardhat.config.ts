import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        // Avalanche Fuji Testnet
        fuji: {
            type: "http",
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            chainId: 43113,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        // Avalanche Mainnet
        avalanche: {
            type: "http",
            url: "https://api.avax.network/ext/bc/C/rpc",
            chainId: 43114,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};

export default config;
