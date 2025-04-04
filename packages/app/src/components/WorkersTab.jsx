// WorkersTab.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import DataService from '../api/DataService.js';

// WorkersTab.jsx changes
// Focus on fixing the worker display issue

const WorkersTab = ({ data }) => {
    console.log("WorkersTab data received:", {
        worker_fees_length: data.worker_fees.length,
        worker_connections_length: data.worker_connections.length,
        unique_regions_fees: [...new Set(data.worker_fees.map(w => w.region))],
        unique_regions_connections: [...new Set(data.worker_connections.map(w => w.region))]
    });

    // Helper to get the most recent worker data

    const getLatestWorkerData = () => {
        console.log("worker_fees:", data.worker_fees);
        console.log("worker_connections:", data.worker_connections);

        // Instead of merging, keep the workers separate by region and type
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
                connection_count: 0 // Default, may be updated below
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
                    connection_count: worker.connection_count || 0
                });
            }
        });

        console.log("Combined worker data:", allWorkers);
        return allWorkers;
    };
    // Get combined worker data
    const workerData = getLatestWorkerData();

    // Log filter results to debug
    console.log("Workers with fees:", workerData.filter(worker => worker.total_fees > 0).length);
    console.log("Workers with connections:", workerData.filter(worker => worker.connection_count > 0).length);

    return (
        <>
            <section className="worker-stats-grid">
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Worker Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="worker-table-container">
                            <table className="worker-table">
                                <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Type</th>
                                    <th>Region</th>
                                    <th>Pending (ETH)</th>
                                    <th>Paid (ETH)</th>
                                    <th>Total (ETH)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {workerData
                                    // Remove the filter to show all workers, even with zero fees
                                    // .filter(worker => worker.total_fees > 0)
                                    .sort((a, b) => b.total_fees - a.total_fees) // Sort by total fees
                                    .map((worker, index) => (
                                        <tr key={index}>
                                            <td>{DataService.shortenAddress(worker.ethAddress)}</td>
                                            <td>
                                            <span className={`node-type-badge node-type-${worker.node_type}`}>
                                                {worker.node_type}
                                            </span>
                                            </td>
                                            <td>{worker.region}</td>
                                            <td className="text-right">{DataService.formatEth(worker.pending_fees)}</td>
                                            <td className="text-right">{DataService.formatEth(worker.paid_fees)}</td>
                                            <td className="text-right">{DataService.formatEth(worker.total_fees)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Worker Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="worker-table-container">
                            <table className="worker-table">
                                <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Type</th>
                                    <th>Region</th>
                                    <th>Connections</th>
                                </tr>
                                </thead>
                                <tbody>
                                {workerData
                                    // Remove the filter to show all workers, even with zero connections
                                    // .filter(worker => worker.connection_count > 0)
                                    .sort((a, b) => b.connection_count - a.connection_count) // Sort by connection count
                                    .map((worker, index) => (
                                        <tr key={index}>
                                            <td>{DataService.shortenAddress(worker.ethAddress)}</td>
                                            <td>
                                            <span className={`node-type-badge node-type-${worker.node_type}`}>
                                                {worker.node_type}
                                            </span>
                                            </td>
                                            <td>{worker.region}</td>
                                            <td className="text-right">{worker.connection_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </>
    );
};
export default WorkersTab;
