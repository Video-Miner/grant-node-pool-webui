// DataService.js
export default class DataService {
    static BASE_URL = "https://api.grant-node.xyz/grant-node-metrics";
    static REGIONS = ["us-central", "eu-central"];
    static NODE_TYPES = ["transcode"];
    static ENDPOINTS = ["worker_summary", "worker_performance"];

    // Main method to fetch all data
    static async fetchPoolDetails() {
        try {
            const allData = {
                summary: {
                    total_workers: 0,
                    total_active_connections: 0,
                    total_pending_fees: 0,
                    total_paid_fees: 0,
                    average_pending_per_worker: 0,
                    average_paid_per_worker: 0
                },
                worker_fees: [],
                worker_connections: [],
                worker_rankings: {
                    by_fees: [],
                    by_transcode_performance: [],
                    by_ai_response_time: []
                },
                transcode_performance: [],
                ai_performance: [],
                last_updated: new Date().toISOString()
            };

            // Fetch all data from all regions and node types
            const promises = [];

            for (const region of this.REGIONS) {
                for (const nodeType of this.NODE_TYPES) {
                    for (const endpoint of this.ENDPOINTS) {
                        const url = `${this.BASE_URL}/${region}/${nodeType}/${endpoint}.json`;
                        const promise = this.fetchData(url, region, nodeType, endpoint);
                        promises.push(promise);
                    }
                }
            }

            // Wait for all requests to complete (even if some fail)
            const results = await Promise.allSettled(promises);

            // Process successful results
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    this.processData(result.value, allData);
                }
            });

            // Calculate aggregates and prepare final data object
            this.calculateAggregates(allData);
            this.prepareRankings(allData);

            return allData;
        } catch (error) {
            console.error("Error fetching pool details:", error);
            return null;
        }
    }

    // Helper method to fetch data from a specific URL
    static async fetchData(url, region, nodeType, endpoint) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch data from ${url}: ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            return {
                data,
                region,
                nodeType,
                endpoint
            };
        } catch (error) {
            console.warn(`Error fetching ${url}:`, error);
            return null;
        }
    }

    // Process data from a single endpoint and add it to the combined data object
    static processData(result, allData) {
        const { data, region, nodeType, endpoint } = result;

        if (endpoint === 'worker_summary') {
            // Process worker_summary data
            if (data.data && data.data.workers) {
                Object.values(data.data.workers).forEach(worker => {
                    // Add worker fee data
                    const existingFeeWorker = allData.worker_fees.find(w =>
                        w.ethAddress === worker.eth_address &&
                        w.region === worker.region &&
                        w.node_type === worker.node_type
                    );

                    if (!existingFeeWorker) {
                        // Add new worker fee entry
                        allData.worker_fees.push({
                            ethAddress: worker.eth_address,
                            node_type: worker.node_type,
                            region: worker.region,
                            pending_fees: worker.pending_fees || 0,
                            paid_fees: worker.total_fees_paid || 0,
                            total_fees: worker.total_fees || 0
                        });
                    }

                    // Add worker connection data
                    const existingConnectionWorker = allData.worker_connections.find(w =>
                        w.ethAddress === worker.eth_address &&
                        w.region === worker.region &&
                        w.node_type === worker.node_type
                    );

                    if (!existingConnectionWorker) {
                        // Add new worker connection entry
                        allData.worker_connections.push({
                            ethAddress: worker.eth_address,
                            node_type: worker.node_type,
                            region: worker.region,
                            connection_count: worker.connection_count || 0
                        });
                    }
                });

                // Update summary data
                allData.summary.total_workers += data.data.aggregates.total_workers || 0;
                allData.summary.total_active_connections += data.data.aggregates.total_connections || 0;
                allData.summary.total_pending_fees += data.data.aggregates.total_pending_fees || 0;
                allData.summary.total_paid_fees += data.data.aggregates.total_fees_paid || 0;
            }
        } else if (endpoint === 'worker_performance') {
            // Process worker_performance data
            if (nodeType === 'transcode' && data.transcode_performance) {
                // Add transcode performance data
                data.transcode_performance.forEach(perf => {
                    allData.transcode_performance.push({
                        ethAddress: perf.worker_address,
                        region,
                        avg_real_time_ratio: perf.mean_real_time_ratio,
                        avg_response_time: perf.mean_response_time,
                        job_count: perf.job_count
                    });
                });
            }

            if (nodeType === 'ai' && data.ai_performance) {
                // Add AI performance data
                data.ai_performance.forEach(perf => {
                    allData.ai_performance.push({
                        ethAddress: perf.worker_address,
                        modelID: perf.model_id,
                        pipeline: perf.pipeline,
                        region,
                        avg_response_time: perf.mean_response_time,
                        job_count: perf.job_count
                    });
                });
            }
        }
    }

    // Calculate aggregate metrics
    static calculateAggregates(data) {
        // Calculate average fees per worker
        if (data.summary.total_workers > 0) {
            data.summary.average_pending_per_worker = data.summary.total_pending_fees / data.summary.total_workers;
            data.summary.average_paid_per_worker = data.summary.total_paid_fees / data.summary.total_workers;
        }

        // Set last updated timestamp
        data.last_updated = new Date().toISOString();
    }

    // Prepare worker rankings
    static prepareRankings(data) {
        const workerFeesMap = new Map();

        // First, aggregate fees by unique ETH address
        data.worker_fees.forEach(worker => {
            const address = worker.ethAddress;
            if (!workerFeesMap.has(address)) {
                workerFeesMap.set(address, {
                    ethAddress: address,
                    total_fees: 0
                });
            }

            workerFeesMap.get(address).total_fees += worker.total_fees || 0;
        });
        // Convert to array, sort by total fees, and take top 10
        data.worker_rankings.by_fees = Array.from(workerFeesMap.values())
            .sort((a, b) => b.total_fees - a.total_fees)
            .slice(0, 10);

        // Rank workers by transcode performance (real-time ratio)
        data.worker_rankings.by_transcode_performance = data.transcode_performance
            .map(worker => ({
                ethAddress: worker.ethAddress,
                avg_real_time_ratio: worker.avg_real_time_ratio
            }))
            .sort((a, b) => b.avg_real_time_ratio - a.avg_real_time_ratio)
            .slice(0, 10);

        // Rank workers by AI response time (faster is better)
        data.worker_rankings.by_ai_response_time = data.ai_performance
            .map(worker => ({
                ethAddress: worker.ethAddress,
                modelID: worker.modelID,
                avg_response_time: worker.avg_response_time
            }))
            .sort((a, b) => a.avg_response_time - b.avg_response_time)
            .slice(0, 10);
    }

    // Helper function for formatting ETH values (for use in components)
    static formatEth(weiValue) {
        // Convert from wei to ETH with 6 decimal places
        if (typeof weiValue !== 'number') {
            return '0.000000';
        }
        return (weiValue / 1e18).toFixed(6);
    }

    // Helper function to format response times from ns to ms or s
    static formatTime(nanoseconds) {
        if (nanoseconds < 1_000_000) {
            return `${(nanoseconds / 1000).toFixed(2)} μs`;
        } else if (nanoseconds < 1_000_000_000) {
            return `${(nanoseconds / 1_000_000).toFixed(2)} ms`;
        } else {
            return `${(nanoseconds / 1_000_000_000).toFixed(2)} s`;
        }
    }

    // Helper to format addresses to shortened form
    static shortenAddress(address) {
        if (!address || typeof address !== 'string') return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}
