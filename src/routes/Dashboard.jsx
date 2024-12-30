// Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Tooltip,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    Cancel,
    CheckCircle,
    ExpandMore,
    HourglassBottom, InfoOutlined,
    Payments,
    PeopleOutline,
    QueryStats,
    Refresh,
} from "@mui/icons-material";
import Public from "@mui/icons-material/Public";
import { useTheme } from "@mui/material/styles";
import DataService from "../api/DataService.js";

const Dashboard = () => {
    const theme = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(
        localStorage.getItem("lastUpdateTime") || "Never"
    );

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
            <Box sx={{ display: "flex", justifyContent: "center", mt: theme.spacing(4) }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Typography variant="h6" color="error" align="center">
                Unable to load dashboard data. Please try again later.
            </Typography>
        );
    }

    // Destructure transformed data.
    const { poolOverview } = data;
    const globalSummary = poolOverview.summary;
    const globalNodes = poolOverview.nodes;

    // Global pool members grid columns.
    const globalColumns = [
        {
            field: "poolMember",
            headerName: "Pool Member",
            minWidth: 350,
            flex: 1,
            renderHeader: () => (
                <Tooltip title="Wallet address of the pool member">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Pool Member</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "region",
            headerName: "Region",
            minWidth: 140,
            flex: 0,
            renderHeader: () => (
                <Tooltip title="Geographic region of the node">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Region</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "nodeType",
            headerName: "Type",
            flex: 0,
            renderHeader: () => (
                <Tooltip title="Type of Pool Node (AI or Transcoding)">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Type</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "pending",
            headerName: "Pending Fees (ETH)",
            minWidth: 50,
            flex: 0,
            renderHeader: () => (
                <Tooltip title="Fees queued for payout">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Pending Fees (ETH)</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "total",
            headerName: "Total Payouts (ETH)",
            minWidth: 50,
            flex: 0,
            renderHeader: () => (
                <Tooltip title="Total ETH disbursed to pool members">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Total Payouts (ETH)</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 50,
            flex: 0,
            renderHeader: () => (
                <Tooltip title="Connectivity status of the node">
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2">Status</Typography>
                    </Box>
                </Tooltip>
            ),
            renderCell: (params) =>
                params.row.isConnected ? (
                    <Tooltip title="Node is connected">
                        <ArrowUpwardIcon sx={{ color: theme.palette.success.main }} />
                    </Tooltip>
                ) : (
                    <Tooltip title="Node is disconnected">
                        <ArrowDownwardIcon sx={{ color: theme.palette.error.main }} />
                    </Tooltip>
                ),
        },
    ];

    return (
        <Container sx={{ mt: { xs: theme.spacing(2), md: theme.spacing(4) }, mb: theme.spacing(4) }}>
            <Box>
                {/* Pool Overview Container */}
                <Box
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        p: theme.spacing(3),
                        borderRadius: theme.shape.borderRadius,
                        mb: theme.spacing(3),
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            mb: theme.spacing(2),
                        }}
                    >
                        <Box display="flex" alignItems="center" sx={{ mb: { xs: theme.spacing(1), sm: 0 } }}>
                            <Tooltip title="Overview of the entire pool performance metrics">
                                <QueryStats sx={{ mr: theme.spacing(1) }} />
                            </Tooltip>
                            <Typography variant="h5" fontWeight={600}>
                                Pool Overview
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Tooltip title="Time when the dashboard was last refreshed">
                                <Typography variant="caption" color="text.secondary" sx={{ mr: theme.spacing(1) }}>
                                    Last Updated: {lastUpdated}
                                </Typography>
                            </Tooltip>
                            <Tooltip title="Click to refresh the dashboard data">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Refresh />}
                                    onClick={loadData}
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box sx={{ p: theme.spacing(2), borderRadius: theme.shape.borderRadius }}>
                        <Grid container spacing={theme.spacing(3)}>
                            <Grid item xs={12} md={4}>
                                <Box display="flex" alignItems="center">
                                    <Tooltip title="Cumulative ETH disbursed to all pool members">
                                        <Payments color="primary" sx={{ mr: theme.spacing(1) }} />
                                    </Tooltip>
                                    <Typography variant="body1">
                                        <strong>Total Payouts:</strong> {globalSummary.totalPaidFees} ETH
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box display="flex" alignItems="center">
                                    <Tooltip title="Fees waiting to be paid out to members">
                                        <HourglassBottom color="primary" sx={{ mr: theme.spacing(1) }} />
                                    </Tooltip>
                                    <Typography variant="body1">
                                        <strong>Pending Fees:</strong> {globalSummary.totalPendingFees} ETH
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box display="flex" alignItems="center">
                                    <Tooltip title="Ratio of nodes currently connected to total nodes">
                                        <PeopleOutline color="primary" sx={{ mr: theme.spacing(1) }} />
                                    </Tooltip>
                                    <Typography variant="body1">
                                        <strong>Connected Nodes:</strong> {globalSummary.connectedNodes} / {globalSummary.totalNodes}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Global Pool Members */}
                <Box
                    sx={{
                        p: theme.spacing(2),
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: 1,
                        mb: theme.spacing(3),
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                        <Tooltip title="List of all global pool members and their current metrics">
                            <PeopleOutline color="primary" sx={{ mr: theme.spacing(1) }} />
                        </Tooltip>
                        <Typography variant="h6">Global Pool Members</Typography>
                    </Box>
                    <DataGrid
                        rows={globalNodes.map((node, index) => ({
                            id: `${node.ethAddress}-${node.region}-${index}`,
                            poolMember: node.ethAddress,
                            region: node.region,
                            nodeType: node.nodeType,
                            pending: node.pending_fees,
                            total: node.paid_fees,
                            isConnected: node.isConnected,
                        }))}
                        columns={globalColumns}
                        disableSelectionOnClick
                        pageSize={20}
                    />
                </Box>

                {/* Regional Status */}
                <Box
                    sx={{
                        p: theme.spacing(2),
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: 1,
                        mb: theme.spacing(3),
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                        <Tooltip title="Performance and connectivity status for each region">
                            <Public color="primary" sx={{ mr: theme.spacing(1) }} />
                        </Tooltip>
                        <Typography variant="h6">Regional Status</Typography>
                    </Box>
                    {Object.values(data.regions).map((regionData) => (
                        <Accordion
                            key={regionData.label}
                            sx={{
                                borderRadius: theme.shape.borderRadius,
                                mb: theme.spacing(2),
                                boxShadow: 1,
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box display="flex" alignItems="center" width="100%" sx={{ cursor: "pointer" }}>
                                    {regionData.isDown ? (
                                        <Tooltip title="This region is currently offline">
                                            <Cancel sx={{ color: theme.palette.error.main, mr: theme.spacing(1) }} />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="This region is online">
                                            <CheckCircle sx={{ color: theme.palette.success.main, mr: theme.spacing(1) }} />
                                        </Tooltip>
                                    )}
                                    <Tooltip title={`Region: ${regionData.label}. Click to view detailed metrics.`}>
                                        <Typography variant="h6">{regionData.label}</Typography>
                                    </Tooltip>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {regionData.isDown ? (
                                    <Card
                                        elevation={1}
                                        sx={{
                                            borderRadius: theme.shape.borderRadius,
                                            p: theme.spacing(2),
                                            backgroundColor: theme.palette.background.default,
                                        }}
                                    >
                                        <CardContent>
                                                <Typography variant="body2">
                                                    This region is currently offline. Please check back later for updated information.
                                                </Typography>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card
                                        elevation={1}
                                        sx={{
                                            borderRadius: theme.shape.borderRadius,
                                            p: theme.spacing(2),
                                            backgroundColor: theme.palette.background.default,
                                        }}
                                    >
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                                                <Tooltip title="Total nodes registered in this region">
                                                    <PeopleOutline color="primary" sx={{ mr: theme.spacing(1) }} />
                                                </Tooltip>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Total Nodes:</strong> {regionData.summary.totalNodes}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                                                <Tooltip title="Currently connected nodes in this region">
                                                    <PeopleOutline color="primary" sx={{ mr: theme.spacing(1) }} />
                                                </Tooltip>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Connected Nodes:</strong> {regionData.summary.connectedNodes}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                                                <Tooltip title="Total pending fees (ETH) in this region">
                                                    <HourglassBottom color="primary" sx={{ mr: theme.spacing(1) }} />
                                                </Tooltip>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Pending Fees:</strong> {regionData.summary.totalPendingFees} ETH
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Tooltip title="Total paid fees (ETH) in this region">
                                                    <Payments color="primary" sx={{ mr: theme.spacing(1) }} />
                                                </Tooltip>
                                                <Typography variant="body2">
                                                    <strong>Total Paid Fees:</strong> {regionData.summary.totalPaidFees} ETH
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;
