// TranscodeTab.jsx
import React from 'react';
import { Layers, Server, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import DataService from '../api/DataService.js';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { COLORS, getRegionColor } from '../constants/colors';

const TranscodeTab = ({ data }) => {

    // Prepare transcode performance data for chart
    const transcodePerformanceData = data.transcode_performance.map(item => ({
        name: item.region,
        realTimeRatio: Number((item.avg_real_time_ratio || 0).toFixed(2)),
        responseTime: Number((item.avg_response_time || 0).toFixed(2)),
        jobCount: item.job_count || 0,
        address: DataService.shortenAddress(item.ethAddress || '')
    }));

    // Group performance data by region for better visualization
    const groupedByRegion = transcodePerformanceData.reduce((acc, item) => {
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

    // Calculate totals for the metric cards
    const totalWorkers = data.transcode_performance.length;
    const totalRegions = new Set(data.transcode_performance.map(item => item.region)).size;
    const totalJobs = data.transcode_performance.reduce((sum, item) => sum + (item.job_count || 0), 0);

    // Calculate weighted average real-time ratio
    const avgRealTimeRatio = data.transcode_performance.reduce((weightedSum, item) => {
        return weightedSum + ((item.avg_real_time_ratio || 0) * (item.job_count || 0));
    }, 0) / Math.max(totalJobs, 1); // Avoid division by zero

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
                            {totalWorkers}
                        </p>
                        <p className="metric-subtitle">Across {totalRegions} regions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Total Jobs</CardTitle>
                        <Layers className="metric-icon metric-icon-warning" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {totalJobs.toLocaleString()}
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
                            {avgRealTimeRatio.toFixed(2)}
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
                                {(() => {
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
                                        .map((worker, index) => (
                                            <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                                <td>
                                                    {index < 3 ? (
                                                        <Trophy className={`rank-icon rank-${index + 1}`} />
                                                    ) : (
                                                        <span className="rank-number">{index + 1}</span>
                                                    )}
                                                </td>
                                                <td>{worker.region}</td>
                                                <td>{DataService.shortenAddress(worker.ethAddress)}</td>
                                                <td className="text-right">{(worker.avg_real_time_ratio || 0).toFixed(2)}</td>
                                                <td className="text-right">{(worker.job_count || 0).toLocaleString()}</td>
                                            </tr>
                                        ));
                                })()}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Charts using the grouped region data */}
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
        </>
    );
};
export default TranscodeTab;
