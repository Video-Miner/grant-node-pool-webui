// App.jsx
import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import DataService from './api/DataService.js'
import { Activity, CheckCircle, DollarSign, Moon, RefreshCw, Sun, Users, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './components/Card.jsx'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const PoolDashboard = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(localStorage.getItem('lastUpdateTime') || 'Never')

    const toggleTheme = () => {
        setDarkMode(!darkMode)
    }

    const loadData = async () => {
        setLoading(true)
        const result = await DataService.fetchPoolDetails()
        setData(result)
        setLoading(false)
        const now = new Date().toLocaleString()
        localStorage.setItem('lastUpdateTime', now)
        setLastUpdated(now)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) {
        return <p className="dashboard-loading">Loading...</p>
    }

    if (!data) {
        return <p className="dashboard-loading">Unable to load dashboard data. Please try again later.</p>
    }

    // Destructure data from the API.
    const { poolOverview, regionChartData } = data
    const globalSummary = poolOverview.summary
    const globalNodes = poolOverview.nodes

    return (
        <main className={`dashboard ${darkMode ? 'dark' : ''}`}>
            <div className="dashboard-container">
                <h1 className="dashboard-title">
                    Open Pool Dashboard: Capacity for the Livepeer Network
                </h1>
                <header className="dashboard-header">
                    <div className="dashboard-refresh-container">
                        <button onClick={loadData} className="theme-toggle-button" aria-label="Refresh Data">
                            <RefreshCw className="theme-icon" />
                        </button>
                        <time className="last-updated-text" dateTime={new Date(lastUpdated).toISOString()}>
                            Last updated: {lastUpdated}
                        </time>
                    </div>
                    <div className="theme-toggle">
                        <button className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle Theme">
                            {darkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
                        </button>
                    </div>
                </header>

                <section className="overview-section" aria-label="Global Overview">
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Pending (ETH)</CardTitle>
                            <Activity className="metric-icon metric-icon-warning" />
                        </CardHeader>
                        <CardContent>
                            <p className="metric-value">{globalSummary.totalPendingFees}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Paid (ETH)</CardTitle>
                            <DollarSign className="metric-icon metric-icon-success" />
                        </CardHeader>
                        <CardContent>
                            <p className="metric-value">{globalSummary.totalPaidFees}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="metric-header">
                            <CardTitle className="metric-title">Connected Nodes</CardTitle>
                            <Users className="metric-icon metric-icon-info" />
                        </CardHeader>
                        <CardContent>
                            <p className="metric-value">
                                {globalSummary.connectedNodes} / {globalSummary.totalNodes}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="global-pool-members">
                    <Card>
                        <CardHeader>
                            <CardTitle id="global-pool-members">Global Pool Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="members-table-container">
                                <table className="members-table">
                                    <caption className="sr-only">List of global pool members</caption>
                                    <thead>
                                    <tr>
                                        <th scope="col">Address</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Region</th>
                                        <th scope="col" className="number-cell">Pending (ETH)</th>
                                        <th scope="col" className="number-cell">Paid (ETH)</th>
                                        <th scope="col" className="status-cell">Online</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {globalNodes.map((node, index) => (
                                        <tr key={index}>
                                            <td className="address-cell">{node.ethAddress}</td>
                                            <td>{node.nodeType}</td>
                                            <td>{node.region}</td>
                                            <td className="number-cell">{node.pending_fees}</td>
                                            <td className="number-cell">{node.paid_fees}</td>
                                            <td className="status-cell">
                                                {node.isConnected ? (
                                                    <CheckCircle className="status-icon status-icon-success" aria-label="Online" />
                                                ) : (
                                                    <XCircle className="status-icon status-icon-error" aria-label="Offline" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="regions-section" aria-label="Region Data">
                    <Card>
                        <CardHeader>
                            <CardTitle>Region Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <article className="dashboard-chart-container spaced">
                                <h3 className="chart-title">Connected Nodes By Region</h3>
                                <ResponsiveContainer>
                                    <BarChart data={regionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="connectedNodes" fill="#3b82f6" name="Connected Nodes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </article>

                            <article className="dashboard-chart-container spaced">
                                <h3 className="chart-title">Payouts by Region</h3>
                                <ResponsiveContainer>
                                    <BarChart data={regionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="totalPayout" fill="#10B981" name="Payouts" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </article>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Region Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="region-list">
                                <table className="region-table">
                                    <caption className="sr-only">Region details</caption>
                                    <thead>
                                    <tr>
                                        <th scope="col">Region</th>
                                        <th scope="col">Nodes</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Pending (ETH)</th>
                                        <th scope="col">Paid (ETH)</th>
                                        <th scope="col">Online</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {regionChartData.map((region, index) => (
                                        <tr key={index}>
                                            <td className="region-name">{region.name}</td>
                                            <td className="number-cell">{region.nodesLabel}</td>
                                            <td className="node-type-cell">
                                                {region.nodeTypes.length > 0 ? region.nodeTypes.join(', ') : 'N/A'}
                                            </td>
                                            <td className="number-cell">{region.pendingPayout}</td>
                                            <td className="number-cell">{region.totalPayout}</td>
                                            <td className="status-cell">
                                                {region.status === 'up' ? (
                                                    <CheckCircle className="status-icon status-icon-success" aria-label="Online" />
                                                ) : (
                                                    <XCircle className="status-icon status-icon-error" aria-label="Offline" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    )
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PoolDashboard />
    </StrictMode>
)
