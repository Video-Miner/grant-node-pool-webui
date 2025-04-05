// DataService.js
export default class DataService {
    static BASE_URL = import.meta.env.VITE_BASE_URL;
    static ENDPOINTS = import.meta.env.VITE_ENDPOINTS.split(',');

    // Parse the JSON mapping of regions to available node types
    static REGION_NODE_MAP = (() => {
        try {
            return JSON.parse(import.meta.env.VITE_REGION_NODE_MAP || '{}');
        } catch (e) {
            console.error("Error parsing REGION_NODE_MAP", e);
            return {};
        }
    })();

    // Derive regions from the mapping
    static REGIONS = Object.keys(this.REGION_NODE_MAP);

    // Derive all node types from the mapping
    static NODE_TYPES = (() => {
        const nodeTypesSet = new Set();
        Object.values(this.REGION_NODE_MAP).forEach(nodeTypes => {
            nodeTypes.forEach(nodeType => nodeTypesSet.add(nodeType));
        });
        return Array.from(nodeTypesSet);
    })();

    // Get valid node types for a given region
    static getNodeTypesForRegion(region) {
        return this.REGION_NODE_MAP[region] || [];
    }

    // Main method to fetch all data
    static async fetchPoolDetails() {
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
            last_updated: new Date().toISOString(),

            // Pre-processed data for UI components
            ui: {
                overview: null,
                transcode: null,
                ai: null,
                workers: null
            }
        };

        // Check for required configuration values
        if (!this.BASE_URL) {
            console.error("Missing BASE_URL configuration.");
            return allData;
        }
        if (this.REGIONS.length === 0) {
            console.error("No regions found in REGION_NODE_MAP configuration.");
            return allData;
        }
        if (this.NODE_TYPES.length === 0) {
            console.error("No node types found in REGION_NODE_MAP configuration.");
            return allData;
        }
        if (!this.ENDPOINTS || this.ENDPOINTS.length === 0) {
            console.error("Missing or invalid ENDPOINTS configuration.");
            return allData;
        }

        try {
            // Fetch all data from valid region and node type combinations
            const promises = [];

            for (const region of this.REGIONS) {
                const nodeTypesForRegion = this.getNodeTypesForRegion(region);

                for (const nodeType of nodeTypesForRegion) {
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

            // Prepare UI-specific data
            this.prepareUIData(allData);

            return allData;
        } catch (error) {
            console.error("Error fetching pool details:", error);
            return allData;
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
            // Process worker_summary data (unchanged)
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
                // Add transcode performance data with compute unit metrics included
                data.transcode_performance.forEach(perf => {
                    allData.transcode_performance.push({
                        ethAddress: perf.worker_address,
                        region,
                        avg_real_time_ratio: perf.mean_real_time_ratio,
                        avg_response_time: perf.mean_response_time,
                        job_count: perf.job_count,
                        // Add compute units metrics with the correct field names
                        median_compute_units_per_second: perf.median_compute_units_per_second,
                        mean_compute_units_per_second: perf.mean_compute_units_per_second,
                        min_compute_units_per_second: perf.min_compute_units_per_second,
                        max_compute_units_per_second: perf.max_compute_units_per_second,
                        total_compute_units: perf.total_compute_units,
                        total_fees: perf.total_fees
                    });
                });
            }

            if (nodeType === 'ai' && data.ai_performance) {
                // Add AI performance data (unchanged)
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

    // NEW: Prepare data specifically for UI components
    static prepareUIData(data) {
        // Overview tab data
        data.ui.overview = this.prepareOverviewData(data);

        // Transcode tab data
        data.ui.transcode = this.prepareTranscodeData(data);

        // AI tab data
        data.ui.ai = this.prepareAIData(data);

        // Workers tab data
        data.ui.workers = this.prepareWorkersData(data);
    }

    // Helper function for the Overview tab
    static prepareOverviewData(data) {
        // Group workers by region for pie chart
        const regionData = this.groupByProperty(data.worker_connections, 'region');

        // Group workers by node type for pie chart
        const nodeTypeData = this.groupByProperty(data.worker_connections, 'node_type');

        // Prepare region fee data for bar chart
        const regionFeeData = data.worker_fees.reduce((acc, worker) => {
            const region = worker.region;
            if (!acc[region]) {
                acc[region] = {
                    name: region,
                    pending: 0,
                    paid: 0,
                    total: 0
                };
            }

            acc[region].pending += Number(worker.pending_fees || 0);
            acc[region].paid += Number(worker.paid_fees || 0);
            acc[region].total += Number(worker.total_fees || 0);

            return acc;
        }, {});

        const regionFeesChartData = Object.values(regionFeeData).map(item => ({
            name: item.name,
            pending: Number((item.pending / 1e18).toFixed(4)),
            paid: Number((item.paid / 1e18).toFixed(4)),
            total: Number((item.total / 1e18).toFixed(4))
        }));

        return {
            regionData,
            nodeTypeData,
            regionFeesChartData,
            // Include formatted summary data
            summary: {
                total_workers: data.summary.total_workers,
                total_active_connections: data.summary.total_active_connections,
                total_pending_fees_formatted: this.formatEth(data.summary.total_pending_fees),
                total_paid_fees_formatted: this.formatEth(data.summary.total_paid_fees),
                average_pending_per_worker_formatted: this.formatEth(data.summary.average_pending_per_worker),
                average_paid_per_worker_formatted: this.formatEth(data.summary.average_paid_per_worker)
            },
            // Top workers by fees with formatted values
            topWorkersByFees: data.worker_rankings.by_fees.map(worker => ({
                ...worker,
                formattedTotalFees: this.formatEth(worker.total_fees),
                shortenedAddress: this.shortenAddress(worker.ethAddress)
            }))
        };
    }

    // Helper function for the Transcode tab
// Helper function for the Transcode tab
    static prepareTranscodeData(data) {
        // Process transcode performance data and group by region
        const transcodePerformanceData = data.transcode_performance.map(item => ({
            name: item.region,
            realTimeRatio: Number((item.avg_real_time_ratio || 0).toFixed(2)),
            responseTime: Number((item.avg_response_time || 0).toFixed(2)),
            jobCount: item.job_count || 0,
            address: this.shortenAddress(item.ethAddress || '')
        }));

        // Group by region for charts
        const groupedByRegion = this.groupTranscodeDataByRegion(transcodePerformanceData);

        // Calculate metrics for cards
        const totalWorkers = data.transcode_performance.length;
        const totalRegions = new Set(data.transcode_performance.map(item => item.region)).size;
        const totalJobs = data.transcode_performance.reduce((sum, item) => sum + (item.job_count || 0), 0);

        // Calculate weighted average real-time ratio
        const avgRealTimeRatio = data.transcode_performance.reduce((weightedSum, item) => {
            return weightedSum + ((item.avg_real_time_ratio || 0) * (item.job_count || 0));
        }, 0) / Math.max(totalJobs, 1); // Avoid division by zero

        // Format data for top performers table
        const topPerformers = this.prepareTopTranscodePerformers(data);

        // Calculate compute units metrics from the corrected field names
        const computeUnitsData = data.transcode_performance.filter(item =>
            typeof item.median_compute_units_per_second === 'number' &&
            typeof item.mean_compute_units_per_second === 'number'
        );

        // Default values in case there's no data
        let avgComputeUnitsPerSecond = 0;
        let medianComputeUnitsPerSecond = 0;
        let minComputeUnitsPerSecond = 0;
        let maxComputeUnitsPerSecond = 0;
        let computeUnitsDistributionData = [];

        if (computeUnitsData.length > 0) {
            // Calculate weighted average compute units per second
            const totalJobs = computeUnitsData.reduce((sum, item) => sum + (item.job_count || 0), 0);

            avgComputeUnitsPerSecond = computeUnitsData.reduce((weightedSum, item) => {
                return weightedSum + ((item.mean_compute_units_per_second || 0) * (item.job_count || 0));
            }, 0) / Math.max(totalJobs, 1); // Avoid division by zero

            // Find median - if there's a lot of data, you might want a more efficient approach
            const allValues = computeUnitsData.map(item => item.median_compute_units_per_second || 0).sort((a, b) => a - b);
            const mid = Math.floor(allValues.length / 2);
            medianComputeUnitsPerSecond = allValues.length % 2 !== 0
                ? allValues[mid]
                : (allValues[mid - 1] + allValues[mid]) / 2;

            // Find min and max
            minComputeUnitsPerSecond = Math.min(...computeUnitsData.map(item => item.min_compute_units_per_second || 0));
            maxComputeUnitsPerSecond = Math.max(...computeUnitsData.map(item => item.max_compute_units_per_second || 0));

            // Create distribution data for histogram
            // Group by ranges of 50M compute units
            const distribution = {};
            const stepSize = 50000000; // 50M step size

            computeUnitsData.forEach(item => {
                const value = item.mean_compute_units_per_second || 0;
                const bucket = Math.floor(value / stepSize) * stepSize;

                if (!distribution[bucket]) {
                    distribution[bucket] = 0;
                }

                distribution[bucket]++;
            });

            // Convert to array for chart
            computeUnitsDistributionData = Object.entries(distribution)
                .map(([bucket, count]) => ({
                    name: (parseInt(bucket, 10) / 1000000).toString(), // Convert to millions for display
                    count
                }))
                .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)); // Sort by bucket value
        }


// Process real-time ratio data
        const realTimeData = data.transcode_performance.filter(item =>
            typeof item.avg_real_time_ratio === 'number'
        );

// Default values
        let medianRealTimeRatio = 0;
        let minRealTimeRatio = 0;
        let maxRealTimeRatio = 0;
        let realTimeRatioDistribution = [];

        if (realTimeData.length > 0) {
            // Find median real-time ratio
            const allRatios = realTimeData.map(item => item.avg_real_time_ratio || 0).sort((a, b) => a - b);
            const mid = Math.floor(allRatios.length / 2);
            medianRealTimeRatio = allRatios.length % 2 !== 0
                ? allRatios[mid]
                : (allRatios[mid - 1] + allRatios[mid]) / 2;

            // Find min and max
            minRealTimeRatio = Math.min(...realTimeData.map(item => item.avg_real_time_ratio || 0));
            maxRealTimeRatio = Math.max(...realTimeData.map(item => item.avg_real_time_ratio || 0));

            // Create distribution data for histogram
            // Group by ranges of 5x real-time ratio
            const distribution = {};
            const stepSize = 5; // 5x step size

            realTimeData.forEach(item => {
                const value = item.avg_real_time_ratio || 0;
                const bucket = Math.floor(value / stepSize) * stepSize;

                if (!distribution[bucket]) {
                    distribution[bucket] = 0;
                }

                distribution[bucket]++;
            });

            // Convert to array for chart
            realTimeRatioDistribution = Object.entries(distribution)
                .map(([bucket, count]) => ({
                    name: bucket.toString(),
                    count
                }))
                .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)); // Sort by bucket value
        }

        return {
            groupedByRegion,
            metrics: {
                totalWorkers,
                totalRegions,
                totalJobs,
                avgRealTimeRatio: avgRealTimeRatio.toFixed(2),
                // Add real-time ratio metrics
                medianRealTimeRatio: medianRealTimeRatio.toFixed(2),
                minRealTimeRatio: minRealTimeRatio.toFixed(2),
                maxRealTimeRatio: maxRealTimeRatio.toFixed(2),
                realTimeRatioDistribution,
                // Compute units metrics (already added)
                avgComputeUnitsPerSecond,
                medianComputeUnitsPerSecond,
                minComputeUnitsPerSecond,
                maxComputeUnitsPerSecond,
                computeUnitsDistributionData
            },
            topPerformers
        };
    }

    // Helper function for the AI tab
    static prepareAIData(data) {
        // Prepare AI performance data for charts
        const aiPerformanceData = data.ai_performance.map(item => ({
            name: item.modelID ? item.modelID.split('/')[1] : 'Unknown Model',
            responseTime: Number(((item.avg_response_time || 0) / 1e9).toFixed(2)), // convert to seconds
            jobCount: item.job_count || 0,
            address: this.shortenAddress(item.ethAddress || ''),
            region: item.region || 'Unknown',
            pipeline: item.pipeline || 'Unknown'
        }));

        // Calculate metrics for summary cards
        const totalAIWorkers = data.ai_performance.length;
        const totalModels = new Set(data.ai_performance.map(item => item.modelID)).size;
        const totalJobs = data.ai_performance.reduce((sum, item) => sum + (item.job_count || 0), 0);

        // Calculate weighted average response time
        const avgResponseTime = data.ai_performance.reduce((weightedSum, item) => {
            return weightedSum + ((item.avg_response_time || 0) * (item.job_count || 0));
        }, 0) / Math.max(totalJobs, 1); // Avoid division by zero

        // Prepare rankings data with additional info
        const formattedRankings = data.worker_rankings.by_ai_response_time.map((worker, index) => {
            // Find additional data about this worker
            const perfData = data.ai_performance.find(
                p => p.ethAddress === worker.ethAddress && p.modelID === worker.modelID
            );

            return {
                rank: index + 1,
                modelName: worker.modelID ? worker.modelID.split('/')[1] : '-',
                pipeline: perfData?.pipeline || '-',
                region: perfData?.region || '-',
                address: this.shortenAddress(worker.ethAddress),
                responseTime: this.formatTime(worker.avg_response_time || 0),
                jobCount: (perfData?.job_count || 0).toLocaleString()
            };
        });

        return {
            aiPerformanceData,
            metrics: {
                totalAIWorkers,
                totalModels,
                totalJobs,
                avgResponseTime: this.formatTime(avgResponseTime)
            },
            rankings: formattedRankings
        };
    }

    // Helper function for the Workers tab
    static prepareWorkersData(data) {
        // Combine worker data from multiple sources
        const allWorkers = [];

        // First, add all workers from worker_fees
        data.worker_fees.forEach(worker => {
            allWorkers.push({
                ethAddress: worker.ethAddress,
                node_type: worker.node_type || "unknown",
                region: worker.region || "unknown",
                pending_fees: worker.pending_fees || 0,
                paid_fees: worker.paid_fees || 0,
                total_fees: worker.total_fees || 0,
                connection_count: 0, // Default, may be updated below
                // Add formatted values
                pending_fees_formatted: this.formatEth(worker.pending_fees || 0),
                paid_fees_formatted: this.formatEth(worker.paid_fees || 0),
                total_fees_formatted: this.formatEth(worker.total_fees || 0),
                shortenedAddress: this.shortenAddress(worker.ethAddress)
            });
        });

        // Then match connection data to the existing workers or add new ones
        data.worker_connections.forEach(worker => {
            // Look for matching worker in allWorkers
            const existingWorkerIndex = allWorkers.findIndex(w =>
                w.ethAddress === worker.ethAddress &&
                w.region === worker.region &&
                w.node_type === worker.node_type
            );

            if (existingWorkerIndex >= 0) {
                // Update existing worker with connection data
                allWorkers[existingWorkerIndex].connection_count = worker.connection_count || 0;
            } else {
                // Add new worker
                allWorkers.push({
                    ethAddress: worker.ethAddress,
                    node_type: worker.node_type || "unknown",
                    region: worker.region || "unknown",
                    pending_fees: 0,
                    paid_fees: 0,
                    total_fees: 0,
                    connection_count: worker.connection_count || 0,
                    // Add formatted values
                    pending_fees_formatted: '0.000000',
                    paid_fees_formatted: '0.000000',
                    total_fees_formatted: '0.000000',
                    shortenedAddress: this.shortenAddress(worker.ethAddress)
                });
            }
        });

        // Sort by total fees and connection count for the two tabs
        const workersByFees = [...allWorkers].sort((a, b) => b.total_fees - a.total_fees);
        const workersByConnections = [...allWorkers].sort((a, b) => b.connection_count - a.connection_count);

        return {
            workersByFees,
            workersByConnections
        };
    }

    // NEW: Helper function to group by a property and return in chart-ready format
    static groupByProperty(arr, property) {
        const grouped = {};

        arr.forEach(item => {
            if (!grouped[item[property]]) {
                grouped[item[property]] = [];
            }
            grouped[item[property]].push(item);
        });

        return Object.entries(grouped).map(([name, items]) => ({
            name,
            count: items.length,
            items
        }));
    }

    // NEW: Helper to prepare top transcode performers data
    static prepareTopTranscodePerformers(data) {
        // Group by ETH address and take only the best performance for each
        const addressMap = new Map();

        data.worker_rankings.by_transcode_performance.forEach(worker => {
            if (!addressMap.has(worker.ethAddress) ||
                (worker.avg_real_time_ratio > addressMap.get(worker.ethAddress).avg_real_time_ratio)) {
                // Find the performance data for this worker
                const perfData = data.transcode_performance.find(
                    p => p.ethAddress === worker.ethAddress
                );

                addressMap.set(worker.ethAddress, {
                    ...worker,
                    region: perfData?.region || '-',
                    job_count: perfData?.job_count || 0
                });
            }
        });

        // Convert to array and sort by avg_real_time_ratio
        return Array.from(addressMap.values())
            .sort((a, b) => b.avg_real_time_ratio - a.avg_real_time_ratio)
            .map((worker, index) => ({
                rank: index + 1,
                region: worker.region,
                address: this.shortenAddress(worker.ethAddress),
                speed: (worker.avg_real_time_ratio || 0).toFixed(2),
                jobCount: (worker.job_count || 0).toLocaleString()
            }));
    }

    // NEW: Helper to group transcode data by region
    static groupTranscodeDataByRegion(data) {
        return data.reduce((acc, item) => {
            // If this region already exists in our accumulator, update its values
            const existingRegion = acc.find(r => r.name === item.name);

            if (existingRegion) {
                // Update existing region with total values and averages
                existingRegion.jobCount += item.jobCount;

                // Weighted average for realTimeRatio based on job count
                const totalJobs = existingRegion.jobCount;
                const previousJobWeight = (totalJobs - item.jobCount) / totalJobs;
                const newJobWeight = item.jobCount / totalJobs;

                existingRegion.realTimeRatio =
                    (existingRegion.realTimeRatio * previousJobWeight) +
                    (item.realTimeRatio * newJobWeight);

                // Similar weighted average for response time
                existingRegion.responseTime =
                    (existingRegion.responseTime * previousJobWeight) +
                    (item.responseTime * newJobWeight);

                // Add this worker to the workers array for this region
                existingRegion.workers.push({
                    address: item.address,
                    jobCount: item.jobCount,
                    realTimeRatio: item.realTimeRatio,
                    responseTime: item.responseTime
                });
            } else {
                // Create a new region entry
                acc.push({
                    ...item,
                    workers: [{
                        address: item.address,
                        jobCount: item.jobCount,
                        realTimeRatio: item.realTimeRatio,
                        responseTime: item.responseTime
                    }]
                });
            }

            return acc;
        }, []);
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
