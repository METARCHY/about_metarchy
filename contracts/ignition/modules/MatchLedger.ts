import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MatchLedgerModule", (m) => {
    const matchLedger = m.contract("MatchLedger", []);

    return { matchLedger };
});
