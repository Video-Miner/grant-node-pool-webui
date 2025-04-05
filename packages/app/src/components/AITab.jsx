// AITab.jsx
import React from 'react';
import { Clock, Layers, Server, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { COLORS } from '../constants/colors';

const AITab = ({ data }) => {
    // Get pre-processed data from the UI data
    const { ai } = data.ui || {};

    // Handle case where data isn't available
    if (!ai) {
        return (
            <div className="dashboard-loading">
                <p>No AI performance data available</p>
            </div>
        );
    }

    const { aiPerformanceData, metrics, rankings } = ai;

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
                            {metrics.totalAIWorkers}
                        </p>
                        <p className="metric-subtitle">Running {metrics.totalModels} models</p>
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
                            {metrics.avgResponseTime}
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
                        {rankings && rankings.length > 0 ? (
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
                                    {rankings.map((worker, index) => (
                                        <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                            <td>
                                                {index < 3 ? (
                                                    <Trophy className={`rank-icon rank-${index + 1}`} />
                                                ) : (
                                                    <span className="rank-number">{worker.rank}</span>
                                                )}
                                            </td>
                                            <td>{worker.modelName}</td>
                                            <td>{worker.pipeline}</td>
                                            <td>{worker.region}</td>
                                            <td>{worker.address}</td>
                                            <td className="text-right">{worker.responseTime}</td>
                                            <td className="text-right">{worker.jobCount}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center">No AI model rankings available</p>
                        )}
                    </CardContent>
                </Card>
            </section>

            {aiPerformanceData && aiPerformanceData.length > 0 ? (
                <>
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
            ) : (
                <section>
                    <Card className="card-col-span-4">
                        <CardContent>
                            <p className="text-center">No AI performance data available for charts</p>
                        </CardContent>
                    </Card>
                </section>
            )}
        </>
    );
};

export default AITab;
