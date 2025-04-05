// TranscodeTab.jsx
import React from 'react';
import { Layers, Server, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { COLORS, getRegionColor } from '../constants/colors';

const TranscodeTab = ({ data }) => {
    // Get pre-processed data from the UI data
    const { transcode } = data.ui || {};

    // Handle case where data isn't available
    if (!transcode) {
        return (
            <div className="dashboard-loading">
                <p>No transcode data available</p>
            </div>
        );
    }

    const { groupedByRegion, metrics, topPerformers } = transcode;

    return (
        <>
            <section className="overview-section" aria-label="Transcode Overview">
                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Transcode Workers</CardTitle>
                        <Server className="metric-icon metric-icon-info" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {metrics.totalWorkers}
                        </p>
                        <p className="metric-subtitle">Across {metrics.totalRegions} regions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Total Jobs</CardTitle>
                        <Layers className="metric-icon metric-icon-warning" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {metrics.totalJobs.toLocaleString()}
                        </p>
                        <p className="metric-subtitle">Transcoded segments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Avg Speed</CardTitle>
                        <Zap className="metric-icon metric-icon-success" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {metrics.avgRealTimeRatio}
                        </p>
                        <p className="metric-subtitle">Real-time ratio</p>
                    </CardContent>
                </Card>
            </section>
            <section>
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Top Performers by Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rankings-table-container">
                            <table className="rankings-table">
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Region</th>
                                    <th>Address</th>
                                    <th>Speed</th>
                                    <th>Jobs</th>
                                </tr>
                                </thead>
                                <tbody>
                                {topPerformers.map((worker, index) => (
                                    <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                        <td>
                                            {index < 3 ? (
                                                <Trophy className={`rank-icon rank-${index + 1}`} />
                                            ) : (
                                                <span className="rank-number">{worker.rank}</span>
                                            )}
                                        </td>
                                        <td>{worker.region}</td>
                                        <td>{worker.address}</td>
                                        <td className="text-right">{worker.speed}</td>
                                        <td className="text-right">{worker.jobCount}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Charts using the grouped region data */}
            {groupedByRegion && groupedByRegion.length > 0 ? (
                <>
                    <section>
                        <Card className="card-col-span-4">
                            <CardHeader>
                                <CardTitle>Speed by Region (Real-time Ratio)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={groupedByRegion}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value, name) => [
                                                name === 'realTimeRatio' ? `${value}x` : value,
                                                name === 'realTimeRatio' ? 'Speed' : name
                                            ]} />
                                            <Legend />
                                            <Bar dataKey="realTimeRatio" name="Speed (lower is better)" fill={COLORS.success}>
                                                {groupedByRegion.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getRegionColor(entry.name)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <Card className="card-col-span-4">
                            <CardHeader>
                                <CardTitle>Response Time by Region (ms)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={groupedByRegion}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value} ms`} />
                                            <Legend />
                                            <Bar dataKey="responseTime" name="Response Time" fill={COLORS.info}>
                                                {groupedByRegion.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getRegionColor(entry.name)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <Card className="card-col-span-4">
                            <CardHeader>
                                <CardTitle>Jobs Processed by Region</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={groupedByRegion}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value.toLocaleString()} jobs`} />
                                            <Legend />
                                            <Bar dataKey="jobCount" name="Job Count" fill={COLORS.primary}>
                                                {groupedByRegion.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getRegionColor(entry.name)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <Card className="card-col-span-4">
                            <CardHeader>
                                <CardTitle>Compute Efficiency Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="compute-metrics-grid">
                                    <div className="compute-metric-card">
                                        <h4 className="compute-metric-title">Average Compute Units/s</h4>
                                        <p className="compute-metric-value">
                                            {(metrics.avgComputeUnitsPerSecond / 1000000).toFixed(2) + " M"}
                                        </p>
                                    </div>
                                    <div className="compute-metric-card">
                                        <h4 className="compute-metric-title">Median Compute Units/s</h4>
                                        <p className="compute-metric-value">
                                            {(metrics.medianComputeUnitsPerSecond / 1000000).toFixed(2) + " M"}
                                        </p>
                                    </div>
                                    <div className="compute-metric-card">
                                        <h4 className="compute-metric-title">Min Compute Units/s</h4>
                                        <p className="compute-metric-value">
                                            {(metrics.minComputeUnitsPerSecond / 1000000).toFixed(2) + " M"}
                                        </p>
                                    </div>
                                    <div className="compute-metric-card">
                                        <h4 className="compute-metric-title">Max Compute Units/s</h4>
                                        <p className="compute-metric-value">
                                            {(metrics.maxComputeUnitsPerSecond / 1000000).toFixed(2) + " M"}
                                        </p>
                                    </div>
                                </div>

                                {metrics.computeUnitsDistributionData && metrics.computeUnitsDistributionData.length > 0 ? (
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <BarChart data={metrics.computeUnitsDistributionData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    label={{
                                                        value: 'Compute Units per Second (M)',
                                                        position: 'insideBottom',
                                                        offset: -10
                                                    }}
                                                />
                                                <YAxis
                                                    label={{
                                                        value: 'Number of Workers',
                                                        angle: -90,
                                                        position: 'insideLeft'
                                                    }}
                                                />
                                                <Tooltip
                                                    formatter={(value, name, props) => {
                                                        // Extract the bucket name from props
                                                        const bucketStart = parseInt(props.payload.name, 10);
                                                        if (isNaN(bucketStart)) {
                                                            return [`${value} workers`, "0M CU/s"];
                                                        }
                                                        return [`${value} workers`, `${bucketStart} - ${bucketStart + 50}M CU/s`];
                                                    }}
                                                />
                                                <Bar dataKey="count" fill={COLORS.info}>
                                                    {metrics.computeUnitsDistributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-center">No compute units distribution data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <Card className="card-col-span-4">
                            <CardHeader>
                                <CardTitle>Real-Time Ratio Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="real-time-metrics-grid">
                                    <div className="real-time-metric-card">
                                        <h4 className="real-time-metric-title">Average Ratio</h4>
                                        <p className="real-time-metric-value">
                                            {metrics.avgRealTimeRatio}x
                                        </p>
                                        <p className="real-time-metric-description">
                                            Mean real-time ratio across all workers
                                        </p>
                                    </div>
                                    <div className="real-time-metric-card">
                                        <h4 className="real-time-metric-title">Median Ratio</h4>
                                        <p className="real-time-metric-value">
                                            {metrics.medianRealTimeRatio}x
                                        </p>
                                        <p className="real-time-metric-description">
                                            Median real-time ratio (50th percentile)
                                        </p>
                                    </div>
                                    <div className="real-time-metric-card">
                                        <h4 className="real-time-metric-title">Min Ratio</h4>
                                        <p className="real-time-metric-value">
                                            {metrics.minRealTimeRatio}x
                                        </p>
                                        <p className="real-time-metric-description">
                                            Minimum ratio (fastest transcoding)
                                        </p>
                                    </div>
                                    <div className="real-time-metric-card">
                                        <h4 className="real-time-metric-title">Max Ratio</h4>
                                        <p className="real-time-metric-value">
                                            {metrics.maxRealTimeRatio}x
                                        </p>
                                        <p className="real-time-metric-description">
                                            Maximum ratio (slowest transcoding)
                                        </p>
                                    </div>
                                </div>

                                {metrics.realTimeRatioDistribution && metrics.realTimeRatioDistribution.length > 0 ? (
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <BarChart data={metrics.realTimeRatioDistribution}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    label={{
                                                        value: 'Real-Time Ratio (x)',
                                                        position: 'insideBottom',
                                                        offset: -10
                                                    }}
                                                />
                                                <YAxis
                                                    label={{
                                                        value: 'Number of Workers',
                                                        angle: -90,
                                                        position: 'insideLeft'
                                                    }}
                                                />
                                                <Tooltip
                                                    formatter={(value, name, props) => {
                                                        const bucketStart = parseInt(props.payload.name, 10);
                                                        if (isNaN(bucketStart)) {
                                                            return [`${value} workers`, "0x ratio"];
                                                        }
                                                        return [`${value} workers`, `${bucketStart}x - ${bucketStart + 5}x ratio`];
                                                    }}
                                                />
                                                <Bar dataKey="count" name="Workers" fill={COLORS.success}>
                                                    {metrics.realTimeRatioDistribution.map((entry, index) => {
                                                        // Color coding by performance tiers
                                                        let fillColor;
                                                        const ratioValue = parseInt(entry.name, 10);

                                                        if (ratioValue < 5) {
                                                            fillColor = COLORS.success; // Excellent performance
                                                        } else if (ratioValue < 10) {
                                                            fillColor = COLORS.primary; // Good performance
                                                        } else if (ratioValue < 20) {
                                                            fillColor = COLORS.warning; // Average performance
                                                        } else {
                                                            fillColor = COLORS.error; // Poor performance
                                                        }

                                                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-center">No real-time ratio distribution data available</p>
                                )}

                                {/* Performance tiers legend */}
                                <div className="performance-tiers-legend">
                                    <h4 className="performance-tiers-title">Performance Tiers</h4>
                                    <div className="performance-tiers-grid">
                                        <div className="performance-tier">
                                            <div className="performance-tier-indicator" style={{backgroundColor: COLORS.success}}></div>
                                            <span className="performance-tier-label">Excellent: &lt; 5x</span>
                                        </div>
                                        <div className="performance-tier">
                                            <div className="performance-tier-indicator" style={{backgroundColor: COLORS.primary}}></div>
                                            <span className="performance-tier-label">Good: 5-10x</span>
                                        </div>
                                        <div className="performance-tier">
                                            <div className="performance-tier-indicator" style={{backgroundColor: COLORS.warning}}></div>
                                            <span className="performance-tier-label">Average: 10-20x</span>
                                        </div>
                                        <div className="performance-tier">
                                            <div className="performance-tier-indicator" style={{backgroundColor: COLORS.error}}></div>
                                            <span className="performance-tier-label">Poor: &gt; 20x</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </>
            ) : (
                <section>
                    <Card className="card-col-span-4">
                        <CardContent>
                            <p className="text-center">No regional performance data available</p>
                        </CardContent>
                    </Card>
                </section>
            )}
        </>
    );
};

export default TranscodeTab;
