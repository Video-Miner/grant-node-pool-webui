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
    const [darkMode, setDarkMode] = useState(() => {
        // Try to get dark mode preference from localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState('');
    const [activeTab, setActiveTab] = useState(() => {
        // Try to get active tab from localStorage
        const savedTab = localStorage.getItem('activeTab');
        return savedTab || 'overview'; // Default to 'overview' if no saved tab
    });
    const [loadError, setLoadError] = useState(false); // State for tracking load errors

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        // Save dark mode preference to localStorage
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    };

    const changeTab = (tabName) => {
        setActiveTab(tabName);
        // Save active tab to localStorage
        localStorage.setItem('activeTab', tabName);
    };

    const loadData = async () => {
        setLoading(true);
        setLoadError(false); // Reset error state

        try {
            const result = await DataService.fetchPoolDetails();

            if (result) {
                setData(result);

                // Set last updated time
                const now = new Date().toLocaleString();
                setLastUpdated(now);
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
        const refreshInterval = setInterval(loadData, 60000*60); // Refresh every hour
        return () => clearInterval(refreshInterval);
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

    // Check if we have essential UI data for the active tab
    const hasTabData = () => {
        if (!data || !data.ui) return false;

        switch (activeTab) {
            case 'overview':
                return !!data.ui.overview;
            case 'transcode':
                return !!data.ui.transcode;
            case 'ai':
                return !!data.ui.ai;
            case 'workers':
                return !!data.ui.workers;
            default:
                return false;
        }
    };

    // Render dashboard based on active tab
    const renderDashboardContent = () => {
        // If we don't have essential data for the tab, show a message
        if (!hasTabData()) {
            return (
                <div className="dashboard-loading">
                    <p>No data available for this section</p>
                    <button onClick={loadData} className="btn-primary mt-4">
                        Refresh Data
                    </button>
                </div>
            );
        }

        // Otherwise render the appropriate tab
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
                <header className="dashboard-main-header">
                    <div className="dashboard-title-area">
                        <h1 className="dashboard-title">
                            Open Pool Dashboard
                        </h1>
                        <div className="dashboard-controls">
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
                        </div>
                    </div>

                    <nav className="dashboard-tabs">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => changeTab('overview')}
                        >
                            <ChartIcon className="tab-icon" />
                            <span>Overview</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'transcode' ? 'active' : ''}`}
                            onClick={() => changeTab('transcode')}
                        >
                            <Layers className="tab-icon" />
                            <span>Transcode</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => changeTab('ai')}
                        >
                            <Zap className="tab-icon" />
                            <span>AI</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
                            onClick={() => changeTab('workers')}
                        >
                            <Users className="tab-icon" />
                            <span>Workers</span>
                        </button>
                    </nav>
                </header>

                <div className="dashboard-content">
                    {renderDashboardContent()}
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
