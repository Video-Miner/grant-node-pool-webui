// OverviewTab.jsx
import React from 'react';
import { Activity, DollarSign, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { COLORS, getRegionColor } from '../constants/colors';

const OverviewTab = ({ data }) => {
    // Get pre-processed data from the UI data
    const { overview } = data.ui || {};

    // Handle case where data isn't available
    if (!overview) {
        return (
            <div className="dashboard-loading">
                <p>No overview data available</p>
            </div>
        );
    }

    const { regionData, nodeTypeData, regionFeesChartData, summary, topWorkersByFees } = overview;

    return (
        <>
            <section className="overview-section" aria-label="Global Overview">
                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Total Workers</CardTitle>
                        <Users className="metric-icon metric-icon-info" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{summary.total_workers}</p>
                        <p className="metric-subtitle">{summary.total_active_connections} active connections</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Pending Fees (ETH)</CardTitle>
                        <Activity className="metric-icon metric-icon-warning" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{summary.total_pending_fees_formatted}</p>
                        <p className="metric-subtitle">Avg: {summary.average_pending_per_worker_formatted}/worker</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Paid Fees (ETH)</CardTitle>
                        <DollarSign className="metric-icon metric-icon-success" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{summary.total_paid_fees_formatted}</p>
                        <p className="metric-subtitle">Avg: {summary.average_paid_per_worker_formatted}/worker</p>
                    </CardContent>
                </Card>
            </section>

            <section className="dashboard-grid">
                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Top Workers by Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topWorkersByFees && topWorkersByFees.length > 0 ? (
                            <div className="rankings-table-container">
                                <table className="rankings-table">
                                    <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Address</th>
                                        <th>Total Fees (ETH)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {topWorkersByFees.map((worker, index) => (
                                        <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                            <td>
                                                {index < 3 ? (
                                                    <Trophy className={`rank-icon rank-${index + 1}`} />
                                                ) : (
                                                    <span className="rank-number">{index + 1}</span>
                                                )}
                                            </td>
                                            <td>{worker.shortenedAddress}</td>
                                            <td className="text-right">{worker.formattedTotalFees}</td>
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

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Workers by Region</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {regionData && regionData.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={regionData}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {regionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getRegionColor(entry.name)} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name, props) => [`${value} workers`, props.payload.name]}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center">No region data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Workers by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nodeTypeData && nodeTypeData.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={nodeTypeData}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {nodeTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.nodeTypes[entry.name] || COLORS.gray} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name, props) => [`${value} workers`, props.payload.name]}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center">No node type data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Fees by Region (ETH)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {regionFeesChartData && regionFeesChartData.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={regionFeesChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${value.toFixed(6)} ETH`} />
                                        <Legend />
                                        <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS.warning} />
                                        <Bar dataKey="paid" name="Paid" stackId="a" fill={COLORS.success} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center">No regional fee data available</p>
                        )}
                    </CardContent>
                </Card>
            </section>
        </>
    );
};

export default OverviewTab;
