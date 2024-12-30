// RegionDetails.jsx
import React from "react";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { InfoOutlined, PeopleOutline } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import DataAccordion from "./DataAccording.jsx";

const RegionDetails = ({ regionKey, regionData, regionalColumns }) => {
    const theme = useTheme();
    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: theme.shape.borderRadius,
                p: { xs: theme.spacing(2), md: theme.spacing(3) },
                mb: theme.spacing(3),
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" mb={theme.spacing(1)}>
                    <InfoOutlined sx={{ verticalAlign: "middle", mr: theme.spacing(1) }} />
                    <Typography variant="h6" color="primary">
                        {regionData.label} Region Details
                    </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Detailed statistics for the {regionData.label} pool.
                </Typography>
                <Typography variant="body2" mb={theme.spacing(1)}>
                    <strong>Total Nodes:</strong> {regionData.summary.totalNodes}
                </Typography>
                <Typography variant="body2" mb={theme.spacing(1)}>
                    <strong>Connected Nodes:</strong> {regionData.summary.connectedNodes}
                </Typography>
                <Typography variant="body2" mb={theme.spacing(1)}>
                    <strong>Total Pending Fees:</strong> {regionData.summary.totalPendingFees} ETH
                </Typography>
                <Typography variant="body2" mb={theme.spacing(1)}>
                    <strong>Total Paid Fees:</strong> {regionData.summary.totalPaidFees} ETH
                </Typography>

                {Object.entries(regionData.nodeTypes).map(([nodeType, typeData]) => (
                    <DataAccordion
                        key={nodeType}
                        title={`${nodeType} Pool Members`}
                        icon={<PeopleOutline color="primary" />}
                        description={`Summary: ${typeData.summary.totalNodes} Nodes, ${typeData.summary.connectedNodes} Connected, Pending: ${typeData.summary.totalPendingFees} ETH, Paid: ${typeData.summary.totalPaidFees} ETH`}
                        rows={typeData.nodes.map((node, idx) => ({
                            id: `${node.ethAddress}-${regionKey}-${nodeType}-${idx}`,
                            poolMember: node.ethAddress,
                            pending: node.pending_fees,
                            total: node.paid_fees,
                            isConnected: node.isConnected,
                        }))}
                        columns={regionalColumns}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default RegionDetails;
