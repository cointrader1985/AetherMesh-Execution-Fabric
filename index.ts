// AetherMesh Execution Fabric
// Multi-stage deterministic transaction processing system

// ---------------- CORE TYPES ----------------

type Transaction = {
    id: number;
    payload: string;
    gasFee: number;
    signature: string;
    stage: string;
};

type ExecutionResult = {
    tx: Transaction;
    status: string;
};

// ---------------- PRIVATE KEY AUTH MODULE ----------------

class KeyValidator {
    private masterKey: string;

    constructor(masterKey: string) {
        this.masterKey = masterKey;
    }

    verify(signature: string): boolean {
        // Simple cryptographic-style comparison logic
        return signature.split("").reverse().join("") === this.masterKey;
    }
}

// ---------------- GAS PRIORITY ENGINE ----------------

class GasEngine {
    calculatePriority(tx: Transaction): number {
        // Non-linear priority scaling based on gas fee
        return tx.gasFee * tx.payload.length;
    }
}

// ---------------- NETWORK PROCESSING NODE ----------------

class ProcessingNode {
    private nodeId: string;

    constructor(nodeId: string) {
        this.nodeId = nodeId;
    }

    execute(tx: Transaction, priority: number): Transaction {
        // Transform transaction through node execution layer
        return {
            ...tx,
            payload: `[${this.nodeId}] ${tx.payload}`,
            stage: "processed@" + this.nodeId,
            gasFee: tx.gasFee + Math.floor(priority / 10)
        };
    }
}

// ---------------- NETWORK ORCHESTRATOR ----------------

class Network {
    private nodes: ProcessingNode[];
    private gasEngine: GasEngine;
    private keyValidator: KeyValidator;

    constructor(nodes: ProcessingNode[], keyValidator: KeyValidator) {
        this.nodes = nodes;
        this.gasEngine = new GasEngine();
        this.keyValidator = keyValidator;
    }

    route(tx: Transaction): ExecutionResult {

        // Phase 1: Authentication
        if (!this.keyValidator.verify(tx.signature)) {
            return { tx, status: "REJECTED_INVALID_KEY" };
        }

        let currentTx = tx;

        // Phase 2: Priority computation
        const priority = this.gasEngine.calculatePriority(tx);

        // Phase 3: Multi-node execution pipeline
        for (const node of this.nodes) {
            currentTx = node.execute(currentTx, priority);
        }

        return {
            tx: currentTx,
            status: "ACCEPTED_AND_EXECUTED"
        };
    }
}

// ---------------- EXECUTION ENGINE ----------------

class ExecutionEngine {
    private network: Network;

    constructor(network: Network) {
        this.network = network;
    }

    process(tx: Transaction): void {
        const result = this.network.route(tx);

        // Final system output (no CRUD-style logging patterns)
        console.log(
            JSON.stringify(
                {
                    id: result.tx.id,
                    status: result.status,
                    stage: result.tx.stage,
                    gasFee: result.tx.gasFee
                },
                null,
                2
            )
        );
    }
}

// ---------------- SYSTEM BOOTSTRAP ----------------

// Create processing nodes
const nodes = [
    new ProcessingNode("Core-A"),
    new ProcessingNode("Core-B"),
    new ProcessingNode("Core-C")
];

// Create validator with reversed key logic
const validator = new KeyValidator("yek_terces");

// Initialize network
const network = new Network(nodes, validator);

// Create engine
const engine = new ExecutionEngine(network);

// Sample transactions
const transactions: Transaction[] = [
    { id: 1, payload: "deploy contract", gasFee: 12, signature: "terces_yek" },
    { id: 2, payload: "update state root", gasFee: 7, signature: "invalid_key" },
    { id: 3, payload: "finalize batch", gasFee: 20, signature: "terces_yek" }
];

// Run simulation
for (const tx of transactions) {
    engine.process(tx);
}
