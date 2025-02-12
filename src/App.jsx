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
                <div className="overview-section">
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Paid (ETH)</CardTitle>
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
                            <CardTitle className="metric-title">Pending (ETH)</CardTitle>
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
                                    <th className="number-cell">Paid (ETH)</th>
                                    <th className="number-cell">Pending (ETH)</th>
                                    <th>Type</th>
                                    <th>Region</th>
                                    <th className="status-cell">Online</th>
                                </tr>
                                </thead>
                                <tbody>
                                {globalNodes.map((node, index) => (
                                    <tr key={index}>
                                        <td className="address-cell">{node.ethAddress}</td>
                                        <td className="number-cell">{node.paid_fees}</td>
                                        <td className="number-cell">{node.pending_fees}</td>
                                        <td >{node.nodeType}</td>
                                        <td >{node.region}</td>
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
                                <h3 className="chart-title">Payouts by Region</h3>
                                <ResponsiveContainer>
                                    <BarChart data={regionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis  />
                                        <Tooltip />
                                        <Bar dataKey="totalPayout" fill="#10B981" name="Payouts" />
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
                                <table className="region-table">
                                    <thead>
                                    <tr>
                                        <th>Region</th>
                                        <th>Nodes</th>
                                        <th>Type</th>
                                        <th>Paid (ETH)</th>
                                        <th>Pending (ETH)</th>
                                        <th>Online</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {regionChartData.map((region, index) => (
                                        <tr key={index}>
                                            <td className="region-name">{region.name}</td>
                                            <td className="number-cell">{region.nodesLabel}</td>
                                            <td className="node-type-cell">
                                                {region.nodeTypes.length > 0
                                                    ? region.nodeTypes.join(", ")
                                                    : "N/A"}
                                            </td>
                                            <td className="number-cell">{region.totalPayout}</td>
                                            <td className="number-cell">{region.pendingPayout}</td>
                                            <td className="status-cell">
                                                {region.status === "up" ? (
                                                    <CheckCircle className="status-icon status-icon-success" />
                                                ) : (
                                                    <XCircle className="status-icon status-icon-error" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
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

