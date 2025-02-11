import React, {StrictMode, useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import DataService from "./api/DataService.js";
import {Activity, CheckCircle, DollarSign, Moon, RefreshCw, Sun, Users, XCircle} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "./components/Card.jsx";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const PoolDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(
        localStorage.getItem("lastUpdateTime") || "Never"
    );

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const loadData = async () => {
        setLoading(true);
        const result = await DataService.fetchPoolDetails();
        setData(result);
        setLoading(false);

        // Update the last update time.
        const now = new Date().toLocaleString();
        localStorage.setItem("lastUpdateTime", now);
        setLastUpdated(now);
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="dashboard-loading">
                Unable to load dashboard data. Please try again later.
            </div>
        );
    }

    // Destructure transformed data from the API.
    const { poolOverview, regionChartData } = data;
    const globalSummary = poolOverview.summary;
    const globalNodes = poolOverview.nodes;
    return (
        <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
            <div className="dashboard-container">
                {/* Header: Refresh + Last Updated on left, Dark Mode Toggle on right */}
                <div className="dashboard-header">
                    <div className="dashboard-refresh-container">
                        <button onClick={loadData} className="theme-toggle-button">
                            <RefreshCw className="theme-icon" />
                        </button>
                        <span className="last-updated-text">
                            Last updated: {lastUpdated}
                        </span>
                    </div>
                    <div className="theme-toggle">
                        <button className="theme-toggle-button" onClick={toggleTheme}>
                            {darkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
                        </button>
                    </div>
                </div>

                {/* Pool Overview Section */}
                <div className="overview-section">
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Total Payout (ETH)</CardTitle>
                            <DollarSign className="metric-icon metric-icon-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="metric-value">
                                {globalSummary.totalPaidFees}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Pending Payout (ETH)</CardTitle>
                            <Activity className="metric-icon metric-icon-warning" />
                        </CardHeader>
                        <CardContent>
                            <div className="metric-value">
                                {globalSummary.totalPendingFees}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Connected Nodes</CardTitle>
                            <Users className="metric-icon metric-icon-info" />
                        </CardHeader>
                        <CardContent>
                            <div className="metric-value">
                                {globalSummary.connectedNodes} / {globalSummary.totalNodes}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pool Members Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Global Pool Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="members-table-container">
                            <table className="members-table">
                                <thead>
                                <tr>
                                    <th>Address</th>
                                    <th className="number-cell">Pending (ETH)</th>
                                    <th className="number-cell">Total Payout (ETH)</th>
                                    <th className="status-cell">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {globalNodes.map((node, index) => (
                                    <tr key={index}>
                                        <td className="address-cell">{node.ethAddress}</td>
                                        <td className="number-cell">{node.pending_fees}</td>
                                        <td className="number-cell">{node.paid_fees}</td>
                                        <td className="status-cell">
                                            {node.isConnected ? (
                                                <CheckCircle className="status-icon status-icon-success"/>
                                            ) : (
                                                <XCircle className="status-icon status-icon-error"/>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Region Details Section */}
                <div className="regions-section">
                    <Card>
                        <CardHeader>
                            <CardTitle>Region Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Chart 1: Connected Nodes by Region */}
                            <div className="dashboard-chart-container spaced">
                                <h3 className="chart-title">Connected Nodes By Region</h3>
                                <ResponsiveContainer>
                                    <BarChart data={regionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} label={{ value: "Connected Nodes", angle: -90 }} />
                                        <Tooltip />
                                        <Bar dataKey="connectedNodes" fill="#3b82f6" name="Connected Nodes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Chart 2: Total Payout by Region */}
                            <div className="dashboard-chart-container spaced">
                                <h3 className="chart-title">Total Payout by Region</h3>
                                <ResponsiveContainer>
                                    <BarChart data={regionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis  />
                                        <Tooltip />
                                        <Bar dataKey="totalPayout" fill="#10B981" name="Total Payout" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Region Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="region-list">
                                {regionChartData.map((region, index) => (
                                    <div key={index} className="region-card">
                                        <div className="region-header">
                                            <h3 className="region-name">{region.name}</h3>
                                            {region.status === 'up' ? (
                                                <CheckCircle className="status-icon status-icon-success" />
                                            ) : (
                                                <XCircle className="status-icon status-icon-error" />
                                            )}
                                        </div>
                                        <div className="region-metrics">
                                            <div className="metric">
                                                <p className="metric-label">Nodes</p>
                                                {/* Now shows connected/total */}
                                                <p className="metric-data">{region.nodesLabel}</p>
                                            </div>
                                            <div className="metric">
                                                <p className="metric-label">Total Payout (ETH)</p>
                                                <p className="metric-data">{region.totalPayout}</p>
                                            </div>
                                            <div className="metric">
                                                <p className="metric-label">Pending (ETH)</p>
                                                <p className="metric-data">{region.pendingPayout}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PoolDashboard/>
    </StrictMode>,
)

