/**
 * Transforms an array of node objects into a structured dashboard object.
 *
 * This function performs the following operations:
 * <ul>
 *   <li>Verifies that each node's Ethereum address is well formed.</li>
 *   <li>Converts fee values from wei to ether (1 ETH = 1e18 wei) and formats them as strings with exactly six decimals (e.g. "0.000000").</li>
 *   <li>Converts the <code>last_updated</code> field into a JavaScript <code>Date</code> object.</li>
 *   <li>Normalizes the node connection status to <code>isConnected</code>.</li>
 *   <li>Ensures a nodeType exists and transforms it so that the first letter of each word is capitalized.
 *       However, if the nodeType is exactly 2 characters long, both characters are capitalized.</li>
 *   <li>Groups nodes by region and, within each region, by node type.</li>
 *   <li>Aggregates summary statistics at both the region level and globally.</li>
 *   <li>Bundles the global nodes and summary into a <code>poolOverview</code> property.</li>
 * </ul>
 *
 * @param {Array<Object>} data - An array of node objects.
 * @returns {Object} An object structured as follows:
 * <pre>
 * {
 *   regions: { ... },       // Regions keyed by region name, with node type grouping
 *   poolOverview: {
 *       summary: { ... },   // Global statistics (all monetary values as strings with 6 decimals)
 *       nodes: [ ... ]      // Array of all nodes across regions
 *   }
 * }
 * </pre>
 *
 * @throws {Error} Throws an error if any node has an invalid Ethereum address.
 */
export function transformData(data) {
    // Helper to format a monetary value (in wei) to an ETH string with 6 decimals.
    const formatMoney = (weiValue) => {
        return (Number(weiValue) / 1e18).toFixed(6);
    };

    // Helper to convert a string to title case.
    // If the string length is exactly 2, returns the entire string in uppercase.
    function toTitleCase(str) {
        if (str.length === 2) {
            return str.toUpperCase();
        }
        return str
            .split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Initialize the output structure.
    const result = {
        regions: {},
    };
    // Global summary accumulators.
    let globalSummary = {
        totalNodes: 0,
        connectedNodes: 0,
        totalPendingFees: 0, // We'll accumulate numeric totals then format later.
        totalPaidFees: 0,
    };
    let globalNodes = [];

    data.forEach(regionData => {
        const {region, isRegionDown, nodes} = regionData;

        result.regions[region] = {
            label: region,
            nodes: [],
            isDown: isRegionDown,
            summary: {totalNodes: 0, connectedNodes: 0, totalPendingFees: 0, totalPaidFees: 0},
            nodeTypes: {}
        };

        if (isRegionDown) return; // Skip processing nodes if the region is down

        nodes.forEach(node => {
            if (!isValidEthAddress(node.ethAddress)) {
                throw new Error(`Invalid eth address: ${node.ethAddress}`);
            }

            node.last_updated = new Date(node.last_updated);
            const pendingEthNum = Number(node.pending_fees) / 1e18;
            const paidEthNum = Number(node.paid_fees) / 1e18;
            node.pending_fees = formatMoney(node.pending_fees);
            node.paid_fees = formatMoney(node.paid_fees);
            node.isConnected = Boolean(node.is_connected);
            node.nodeType = toTitleCase(node.nodeType || "Unknown");

            globalNodes.push(node);

            const region = result.regions[node.region];
            region.nodes.push(node);
            region.summary.totalNodes++;
            if (node.isConnected) region.summary.connectedNodes++;
            region.summary.totalPendingFees += pendingEthNum;
            region.summary.totalPaidFees += paidEthNum;

            if (!region.nodeTypes[node.nodeType]) {
                region.nodeTypes[node.nodeType] = {
                    nodes: [],
                    summary: {totalNodes: 0, connectedNodes: 0, totalPendingFees: 0, totalPaidFees: 0}
                };
            }

            region.nodeTypes[node.nodeType].nodes.push(node);
            region.nodeTypes[node.nodeType].summary.totalNodes++;
            if (node.isConnected) region.nodeTypes[node.nodeType].summary.connectedNodes++;
            region.nodeTypes[node.nodeType].summary.totalPendingFees += pendingEthNum;
            region.nodeTypes[node.nodeType].summary.totalPaidFees += paidEthNum;

            globalSummary.totalNodes++;
            if (node.isConnected) globalSummary.connectedNodes++;
            globalSummary.totalPendingFees += pendingEthNum;
            globalSummary.totalPaidFees += paidEthNum;
        });
    });

    globalSummary.totalPendingFees = globalSummary.totalPendingFees.toFixed(6);
    globalSummary.totalPaidFees = globalSummary.totalPaidFees.toFixed(6);

    Object.values(result.regions).forEach(region => {
        region.summary.totalPendingFees = region.summary.totalPendingFees.toFixed(6);
        region.summary.totalPaidFees = region.summary.totalPaidFees.toFixed(6);
        Object.values(region.nodeTypes).forEach(nt => {
            nt.summary.totalPendingFees = nt.summary.totalPendingFees.toFixed(6);
            nt.summary.totalPaidFees = nt.summary.totalPaidFees.toFixed(6);
        });
    });

    result.poolOverview = {summary: globalSummary, nodes: globalNodes};
    return result;
}

function isValidEthAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
