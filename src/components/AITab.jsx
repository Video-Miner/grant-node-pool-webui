// AITab.jsx
import React from 'react';
import { Clock, Layers, Server, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DataService from '../api/DataService.js';

import { COLORS } from '../constants/colors';

const AITab = ({ data, featureFlags = {} }) => {
    // Check if AI feature is enabled
    const isAIEnabled = featureFlags.enableAI || false;

    if (!isAIEnabled) {
        return (
            <section className="coming-soon-container">
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>AI Analytics Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="coming-soon-content">
                            <Server className="coming-soon-icon" />
                            <h3 className="coming-soon-title">Advanced AI Analytics</h3>
                            <p className="coming-soon-description">
                                We're working on bringing you detailed AI worker performance metrics,
                                response times, and job analytics. Stay tuned for this exciting feature!
                            </p>
                            <div className="coming-soon-features">
                                <div className="feature-item">
                                    <Clock className="feature-icon" />
                                    <span>Response time tracking</span>
                                </div>
                                <div className="feature-item">
                                    <Layers className="feature-icon" />
                                    <span>Job performance metrics</span>
                                </div>
                                <div className="feature-item">
                                    <Trophy className="feature-icon" />
                                    <span>Worker rankings</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    // Prepare AI performance data for chart
    const aiPerformanceData = data.ai_performance.map(item => ({
        name: item.modelID ? item.modelID.split('/')[1] : 'Unknown Model',
        responseTime: Number(((item.avg_response_time || 0) / 1e9).toFixed(2)), // convert to seconds
        jobCount: item.job_count || 0,
        address: DataService.shortenAddress(item.ethAddress || ''),
        region: item.region || 'Unknown',
        pipeline: item.pipeline || 'Unknown'
    }));

    // Calculate metrics for the summary cards
    const totalAIWorkers = data.ai_performance.length;
    const totalModels = new Set(data.ai_performance.map(item => item.modelID)).size;
    const totalJobs = data.ai_performance.reduce((sum, item) => sum + (item.job_count || 0), 0);

    // Calculate weighted average response time
    const avgResponseTime = data.ai_performance.reduce((weightedSum, item) => {
        return weightedSum + ((item.avg_response_time || 0) * (item.job_count || 0));
    }, 0) / Math.max(totalJobs, 1); // Avoid division by zero

    return (
        <>
            <section className="overview-section" aria-label="AI Overview">
                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">AI Workers</CardTitle>
                        <Server className="metric-icon metric-icon-info" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {totalAIWorkers}
                        </p>
                        <p className="metric-subtitle">Running {totalModels} models</p>
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
                        <p className="metric-subtitle">AI inferences</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">Avg Response</CardTitle>
                        <Clock className="metric-icon metric-icon-success" />
                    </CardHeader>
                    <CardContent>
                        <p className="metric-value">
                            {DataService.formatTime(avgResponseTime)}
                        </p>
                        <p className="metric-subtitle">Average response time</p>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>AI Models Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rankings-table-container">
                            <table className="rankings-table">
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Model</th>
                                    <th>Pipeline</th>
                                    <th>Region</th>
                                    <th>Address</th>
                                    <th>Response Time</th>
                                    <th>Jobs</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.worker_rankings.by_ai_response_time.map((worker, index) => {
                                    // Find additional data about this worker
                                    const perfData = data.ai_performance.find(
                                        p => p.ethAddress === worker.ethAddress && p.modelID === worker.modelID
                                    );

                                    return (
                                        <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                            <td>
                                                {index < 3 ? (
                                                    <Trophy className={`rank-icon rank-${index + 1}`} />
                                                ) : (
                                                    <span className="rank-number">{index + 1}</span>
                                                )}
                                            </td>
                                            <td>{worker.modelID ? worker.modelID.split('/')[1] : '-'}</td>
                                            <td>{perfData?.pipeline || '-'}</td>
                                            <td>{perfData?.region || '-'}</td>
                                            <td>{DataService.shortenAddress(worker.ethAddress)}</td>
                                            <td className="text-right">{DataService.formatTime(worker.avg_response_time || 0)}</td>
                                            <td className="text-right">
                                                {(perfData?.job_count || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Model Response Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={aiPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value} s`} />
                                    <Legend />
                                    <Bar dataKey="responseTime" name="Response Time (s)" fill={COLORS.info} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="card-col-span-4">
                    <CardHeader>
                        <CardTitle>Jobs by Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={aiPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value.toLocaleString()} jobs`} />
                                    <Legend />
                                    <Bar dataKey="jobCount" name="Job Count" fill={COLORS.primary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </>
    );
};

export default AITab;
