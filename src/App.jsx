// App.jsx
import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DataService from './api/DataService.js';
import { BarChart as ChartIcon, Layers, Moon, RefreshCw, Sun, Users, Zap, XCircle } from 'lucide-react';
import OverviewTab from './components/OverviewTab';
import TranscodeTab from './components/TranscodeTab';
import AITab from './components/AITab';
import WorkersTab from './components/WorkersTab';

const PoolDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'transcode', 'ai', 'workers'
    const [loadError, setLoadError] = useState(false); // New state for tracking load errors

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const loadData = async () => {
        setLoading(true);
        setLoadError(false); // Reset error state

        try {
            const result = await DataService.fetchPoolDetails();

            if (result) {
                setData(result);

                // Set last updated time
                if (result.last_updated) {
                    const formattedDate = new Date(result.last_updated).toLocaleString();
                    setLastUpdated(formattedDate);
                } else {
                    const now = new Date().toLocaleString();
                    setLastUpdated(now);
                }
            } else {
                // Handle the case where fetchPoolDetails returns null
                setLoadError(true);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Optional: Set up an interval to refresh data periodically
        // const refreshInterval = setInterval(loadData, 60000); // Refresh every minute
        // return () => clearInterval(refreshInterval);
    }, []);

    // Update the loading and error states in the render method
    if (loading) {
        return (
            <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
                <div className="dashboard-loading">
                    <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
                    <p>Loading dashboard data from multiple sources...</p>
                </div>
            </div>
        );
    }

    if (loadError || !data) {
        return (
            <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
                <div className="dashboard-loading">
                    <XCircle className="h-8 w-8 text-error mb-4" />
                    <p>Unable to load dashboard data. Some data sources may be unavailable.</p>
                    <button onClick={loadData} className="btn-primary mt-4">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Render dashboard based on active tab
    const renderDashboardContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab data={data} />;
            case 'transcode':
                return <TranscodeTab data={data} />;
            case 'ai':
                return <AITab data={data} />;
            case 'workers':
                return <WorkersTab data={data} />;
            default:
                return <OverviewTab data={data} />;
        }
    };

    return (
        <main className={`dashboard ${darkMode ? 'dark' : ''}`}>
            <div className="dashboard-container">
                {/* Header section now at the top */}
                <header className="dashboard-header">
                    <h1 className="dashboard-title">
                        Livepeer Grant Node Pool Dashboard
                    </h1>
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

                {/* Main content area with sidebar and content */}
                <div className="dashboard-main">
                    <nav className="dashboard-tabs">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <ChartIcon className="tab-icon" />
                            <span>Overview</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'transcode' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transcode')}
                        >
                            <Layers className="tab-icon" />
                            <span>Transcode</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <Zap className="tab-icon" />
                            <span>AI</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('workers')}
                        >
                            <Users className="tab-icon" />
                            <span>Workers</span>
                        </button>
                    </nav>

                    <div className="dashboard-content">
                        {renderDashboardContent()}
                    </div>
                </div>
            </div>
        </main>
    );
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PoolDashboard />
    </StrictMode>
);
