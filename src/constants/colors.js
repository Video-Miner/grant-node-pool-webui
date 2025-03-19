// constants/colors.js
// Centralized color constants to be used across components

export const COLORS = {
    primary: '#3b82f6', // blue
    success: '#10b981', // green
    warning: '#f59e0b', // amber
    error: '#ef4444',   // red
    info: '#6366f1',    // indigo
    gray: '#6b7280',    // gray
    nodeTypes: {
        transcode: '#3b82f6', // blue
        ai: '#8b5cf6'  // purple
    },
    regions: {
        'us-west': '#ef4444',     // red
        'us-central': '#f59e0b',  // amber
        'eu-central': '#10b981',  // green
        'eu-west': '#3b82f6',     // blue
        'oceania': '#8b5cf6',     // purple
        'asia-east': '#ec4899',   // pink
        'default': '#6b7280'      // gray
    },
    charts: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#6366f1'
    ]
};

// Helper function to get region color
export const getRegionColor = (region) => {
    return COLORS.regions[region] || COLORS.regions.default;
};

export default COLORS;
