const urls = import.meta.env.VITE_REGIONAL_API_URLS || "";
const REGIONS = urls
    .split(", ")
    .map((entry) => {
        const match = entry.match(/(.+?)\[(.+?)\]/);
        return match ? {url: match[1], label: match[2]} : null;
    })
    .filter(Boolean);

const transformData = (data)=> {
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

            // Use the region from our transformed data.
            const regionObj = result.regions[node.region];
            regionObj.nodes.push(node);
            regionObj.summary.totalNodes++;
            if (node.isConnected) regionObj.summary.connectedNodes++;
            regionObj.summary.totalPendingFees += pendingEthNum;
            regionObj.summary.totalPaidFees += paidEthNum;

            if (!regionObj.nodeTypes[node.nodeType]) {
                regionObj.nodeTypes[node.nodeType] = {
                    nodes: [],
                    summary: { totalNodes: 0, connectedNodes: 0, totalPendingFees: 0, totalPaidFees: 0 }
                };
            }

            regionObj.nodeTypes[node.nodeType].nodes.push(node);
            regionObj.nodeTypes[node.nodeType].summary.totalNodes++;
            if (node.isConnected) regionObj.nodeTypes[node.nodeType].summary.connectedNodes++;
            regionObj.nodeTypes[node.nodeType].summary.totalPendingFees += pendingEthNum;
            regionObj.nodeTypes[node.nodeType].summary.totalPaidFees += paidEthNum;

            globalSummary.totalNodes++;
            if (node.isConnected) globalSummary.connectedNodes++;
            globalSummary.totalPendingFees += pendingEthNum;
            globalSummary.totalPaidFees += paidEthNum;
        });
    });

    // Format totals.
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

    result.poolOverview = { summary: globalSummary, nodes: globalNodes };
    result.regionChartData = Object.values(result.regions).map(region => ({
        name: region.label,
        connectedNodes: region.summary.connectedNodes,
        totalNodes: region.summary.totalNodes,
        nodesLabel: `${region.summary.connectedNodes}/${region.summary.totalNodes}`,
        totalPayout: region.summary.totalPaidFees,
        pendingPayout: region.summary.totalPendingFees,
        status: region.isDown ? "down" : "up",
    }));

    return result;
}

const isValidEthAddress= (address)=> {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export default class DataService {
    static async fetchPoolDetails() {
        try {
            const responses = await Promise.all(
                REGIONS.map(async (region) => {
                    try {
                        const res = await fetch(`${region.url}/transcoders`);
                        if (!res.ok) throw new Error(`Failed to fetch ${region.label}`);
                        const data = await res.json();
                        return {
                            region: region.label,
                            isRegionDown: false,
                            nodes: data.map((node) => ({...node, region: region.label})),
                        };
                    } catch (error) {
                        return {region: region.label, isRegionDown: true, nodes: []};
                    }
                })
            );
            return transformData(responses);
        } catch (error) {
            return null;
        }
    }
}
