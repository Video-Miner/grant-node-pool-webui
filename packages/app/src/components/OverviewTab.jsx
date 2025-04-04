// OverviewTab.jsx
import React from 'react';
import { Activity, DollarSign, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import DataService from '../api/DataService.js';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { COLORS, getRegionColor } from '../constants/colors';

const OverviewTab = ({ data }) => {
    // Helper function to group workers by region - no changes needed
    const groupByRegion = (arr) => {
        const grouped = {};

        arr.forEach(item => {
            if (!grouped[item.region]) {
                grouped[item.region] = [];
            }
            grouped[item.region].push(item);
        });

        return Object.entries(grouped).map(([name, items]) => ({
            name,
            count: items.length,
            items
        }));
    };

    // Helper function to group by node type - no changes needed
    const groupByNodeType = (arr) => {
        const grouped = {};

        arr.forEach(item => {
            if (!grouped[item.node_type]) {
                grouped[item.node_type] = [];
            }
            grouped[item.node_type].push(item);
        });

        return Object.entries(grouped).map(([name, items]) => ({
            name,
            count: items.length,
            items
        }));
    };

    // Prepare data for region pie chart - using new data structure
    const regionData = groupByRegion(data.worker_connections);

    // Prepare data for node type chart - using new data structure
    const nodeTypeData = groupByNodeType(data.worker_connections);

// Prepare data for region bar chart (total fees by region) - adapted for new data structure
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


    return (
        <>
            <section className="overview-section" aria-label="Global Overview">
                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Total Workers</CardTitle>
                        <Users className="metric-icon metric-icon-info" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{data.summary.total_workers}</p>
                        <p className="metric-subtitle">{data.summary.total_active_connections} active connections</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Pending Fees (ETH)</CardTitle>
                        <Activity className="metric-icon metric-icon-warning" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{DataService.formatEth(data.summary.total_pending_fees)}</p>
                        <p className="metric-subtitle">Avg: {DataService.formatEth(data.summary.average_pending_per_worker)}/worker</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Paid Fees (ETH)</CardTitle>
                        <DollarSign className="metric-icon metric-icon-success" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">{DataService.formatEth(data.summary.total_paid_fees)}</p>
                        <p className="metric-subtitle">Avg: {DataService.formatEth(data.summary.average_paid_per_worker)}/worker</p>
                    </CardContent>
                </Card>
            </section>

            {/* Rest of the component remains the same, already using data.worker_rankings.by_fees */}
            <section className="dashboard-grid">
                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Top Workers by Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                {data.worker_rankings.by_fees.map((worker, index) => (
                                    <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                        <td>
                                            {index < 3 ? (
                                                <Trophy className={`rank-icon rank-${index + 1}`} />
                                            ) : (
                                                <span className="rank-number">{index + 1}</span>
                                            )}
                                        </td>
                                        <td>{DataService.shortenAddress(worker.ethAddress)}</td>
                                        <td className="text-right">{DataService.formatEth(worker.total_fees)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Workers by Region</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Workers by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card className="dashboard-grid-card">
                    <CardHeader>
                        <CardTitle>Fees by Region (ETH)</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </section>
        </>
    );
};

export default OverviewTab;
