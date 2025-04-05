// WorkersTab.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';

const WorkersTab = ({ data }) => {
    // Get pre-processed data from the UI data
    const { workers } = data.ui || {};

    // Handle case where data isn't available
    if (!workers) {
        return (
            <div className="dashboard-loading">
                <p>No worker data available</p>
            </div>
        );
    }

    const { workersByFees, workersByConnections } = workers;

    return (
        <>
            <section className="worker-stats-grid">
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Worker Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workersByFees && workersByFees.length > 0 ? (
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
                                    {workersByFees.map((worker, index) => (
                                        <tr key={index}>
                                            <td>{worker.shortenedAddress}</td>
                                            <td>
                                            <span className={`node-type-badge node-type-${worker.node_type}`}>
                                                {worker.node_type}
                                            </span>
                                            </td>
                                            <td>{worker.region}</td>
                                            <td className="text-right">{worker.pending_fees_formatted}</td>
                                            <td className="text-right">{worker.paid_fees_formatted}</td>
                                            <td className="text-right">{worker.total_fees_formatted}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center">No worker fee data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Worker Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workersByConnections && workersByConnections.length > 0 ? (
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
                                    {workersByConnections.map((worker, index) => (
                                        <tr key={index}>
                                            <td>{worker.shortenedAddress}</td>
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
                        ) : (
                            <p className="text-center">No worker connection data available</p>
                        )}
                    </CardContent>
                </Card>
            </section>
        </>
    );
};

export default WorkersTab;
