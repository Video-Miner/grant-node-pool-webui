// DataAccordion.jsx
import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

const DataAccordion = ({
                           title,
                           rows,
                           columns,
                           description,
                           icon,
                           defaultExpanded = false,
                       }) => {
    const theme = useTheme();
    return (
        <Accordion
            elevation={3}
            sx={{ borderRadius: theme.shape.borderRadius, my: theme.spacing(2) }}
            defaultExpanded={defaultExpanded}
        >
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                    {icon && <Box mr={theme.spacing(1)}>{icon}</Box>}
                    <Typography variant="h6" color="primary">
                        {title}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                {description && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        {description}
                    </Typography>
                )}
                <DataGrid rows={rows} columns={columns} disableSelectionOnClick pageSize={20} />
            </AccordionDetails>
        </Accordion>
    );
};

export default DataAccordion;
