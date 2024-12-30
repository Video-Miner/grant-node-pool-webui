import assert from 'assert';

/* ======= Sample Input Data ======= */
import {transformData} from "./transformer.js";

const sampleInput = [
    {
        ethAddress: "0x1111111111111111111111111111111111111111",
        nodeType: "transcode",
        region: "EU-CENTRAL",
        endpoint_hash: "hash1",
        is_connected: true,
        pending_fees: 1000000000000000000, // 1 ETH in wei
        paid_fees: 500000000000000000,      // 0.5 ETH in wei
        last_updated: "2025-02-07T00:42:39.172312147Z",
        connection: "1.1.1.1:1234"
    },
    {
        ethAddress: "0x2222222222222222222222222222222222222222",
        nodeType: "relay",
        region: "EU-CENTRAL",
        endpoint_hash: "hash2",
        is_connected: false,
        pending_fees: 2000000000000000000, // 2 ETH in wei
        paid_fees: 1000000000000000000,     // 1 ETH in wei
        last_updated: "2025-02-07T01:42:39.172312147Z",
        connection: "1.1.1.2:1234"
    },
    {
        ethAddress: "0x3333333333333333333333333333333333333333",
        nodeType: "transcode",
        region: "US-EAST",
        endpoint_hash: "hash3",
        is_connected: true,
        pending_fees: 3000000000000000000, // 3 ETH in wei
        paid_fees: 1500000000000000000,     // 1.5 ETH in wei
        last_updated: "2025-02-07T02:42:39.172312147Z",
        connection: "1.1.1.3:1234"
    },
    {
        ethAddress: "0x4444444444444444444444444444444444444444",
        nodeType: "transcode",
        region: "US-EAST",
        endpoint_hash: "hash4",
        is_connected: false,
        pending_fees: 4000000000000000000, // 4 ETH in wei
        paid_fees: 2000000000000000000,     // 2 ETH in wei
        last_updated: "2025-02-07T03:42:39.172312147Z",
        connection: "1.1.1.4:1234"
    },
    {
        ethAddress: "0x5555555555555555555555555555555555555555",
        nodeType: "relay",
        region: "AP-SOUTH",
        endpoint_hash: "hash5",
        is_connected: true,
        pending_fees: 5000000000000000000, // 5 ETH in wei
        paid_fees: 2500000000000000000,     // 2.5 ETH in wei
        last_updated: "2025-02-07T04:42:39.172312147Z",
        connection: "1.1.1.5:1234"
    }
];

/* ======= Transform the Data ======= */
const transformed = transformData(sampleInput);

// For illustration, log the full transformed object.
console.log("Transformed Object:");
console.log(JSON.stringify(transformed, null, 2));

/* ======= Unit Tests ======= */

// Global Summary Tests
assert.strictEqual(transformed.globalSummary.totalNodes, 5, "Global: Total nodes should be 5");
assert.strictEqual(transformed.globalSummary.connectedNodes, 3, "Global: Connected nodes should be 3");
// 1 + 2 + 3 + 4 + 5 = 15 ETH pending fees
assert.strictEqual(transformed.globalSummary.totalPendingFees, 15, "Global: Total pending fees should be 15 ETH");
// 0.5 + 1 + 1.5 + 2 + 2.5 = 7.5 ETH paid fees
assert.strictEqual(transformed.globalSummary.totalPaidFees, 7.5, "Global: Total paid fees should be 7.5 ETH");

// EU-CENTRAL Region Tests
const euCentral = transformed.regions["EU-CENTRAL"];
assert.ok(euCentral, "EU-CENTRAL region should exist");
assert.strictEqual(euCentral.label, "EU-CENTRAL", "EU-CENTRAL: Label should be 'EU-CENTRAL'");
assert.strictEqual(euCentral.url, "https://example.com/eu-central", "EU-CENTRAL: URL should be 'https://example.com/eu-central'");
assert.strictEqual(euCentral.summary.totalNodes, 2, "EU-CENTRAL: Should have 2 nodes");
assert.strictEqual(euCentral.summary.connectedNodes, 1, "EU-CENTRAL: Should have 1 connected node");
assert.strictEqual(euCentral.summary.totalPendingFees, 3, "EU-CENTRAL: Total pending fees should be 3 ETH");
assert.strictEqual(euCentral.summary.totalPaidFees, 1.5, "EU-CENTRAL: Total paid fees should be 1.5 ETH");
assert.strictEqual(euCentral.nodeTypes.transcode.length, 1, "EU-CENTRAL: Should have 1 'transcode' node");
assert.strictEqual(euCentral.nodeTypes.relay.length, 1, "EU-CENTRAL: Should have 1 'relay' node");

// US-EAST Region Tests
const usEast = transformed.regions["US-EAST"];
assert.ok(usEast, "US-EAST region should exist");
assert.strictEqual(usEast.label, "US-EAST", "US-EAST: Label should be 'US-EAST'");
assert.strictEqual(usEast.url, "https://example.com/us-east", "US-EAST: URL should be 'https://example.com/us-east'");
assert.strictEqual(usEast.summary.totalNodes, 2, "US-EAST: Should have 2 nodes");
assert.strictEqual(usEast.summary.connectedNodes, 1, "US-EAST: Should have 1 connected node");
assert.strictEqual(usEast.summary.totalPendingFees, 7, "US-EAST: Total pending fees should be 7 ETH");
assert.strictEqual(usEast.summary.totalPaidFees, 3.5, "US-EAST: Total paid fees should be 3.5 ETH");
assert.strictEqual(usEast.nodeTypes.transcode.length, 2, "US-EAST: Should have 2 'transcode' nodes");

// AP-SOUTH Region Tests
const apSouth = transformed.regions["AP-SOUTH"];
assert.ok(apSouth, "AP-SOUTH region should exist");
assert.strictEqual(apSouth.label, "AP-SOUTH", "AP-SOUTH: Label should be 'AP-SOUTH'");
assert.strictEqual(apSouth.url, "https://example.com/ap-south", "AP-SOUTH: URL should be 'https://example.com/ap-south'");
assert.strictEqual(apSouth.summary.totalNodes, 1, "AP-SOUTH: Should have 1 node");
assert.strictEqual(apSouth.summary.connectedNodes, 1, "AP-SOUTH: Should have 1 connected node");
assert.strictEqual(apSouth.summary.totalPendingFees, 5, "AP-SOUTH: Total pending fees should be 5 ETH");
assert.strictEqual(apSouth.summary.totalPaidFees, 2.5, "AP-SOUTH: Total paid fees should be 2.5 ETH");
assert.strictEqual(apSouth.nodeTypes.relay.length, 1, "AP-SOUTH: Should have 1 'relay' node");

// Test fee conversion on a specific node.
euCentral.nodes.forEach((node) => {
    if (node.ethAddress === "0x1111111111111111111111111111111111111111") {
        assert.strictEqual(node.pending_fees, 1, "Node pending fees should be 1 ETH");
        assert.strictEqual(node.paid_fees, 0.5, "Node paid fees should be 0.5 ETH");
    }
});

// Test that an invalid Ethereum address throws an error.
const invalidInput = [
    {
        ethAddress: "0xINVALIDADDRESS",
        nodeType: "transcode",
        region: "EU-CENTRAL",
        endpoint_hash: "hash_invalid",
        is_connected: true,
        pending_fees: 1000000000000000000,
        paid_fees: 500000000000000000,
        last_updated: "2025-02-07T00:42:39.172312147Z",
        connection: "1.1.1.1:1234"
    }
];

assert.throws(
    () => transformData(invalidInput),
    /Invalid eth address/,
    "Should throw an error for an invalid Ethereum address"
);

console.log("All tests passed successfully!");
