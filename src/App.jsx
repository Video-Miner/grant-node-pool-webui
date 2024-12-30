import React from 'react';
import {Outlet} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {CssBaseline} from '@mui/material';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import "./styles/App.css";
const theme = createTheme({
    palette: {
        primary: {
            // Replace "#6EC1E4" with any light blue shade you like.
            main: "#6EC1E4",
            // Optionally, you can also specify light and dark shades:
            light: "#a3e0f7",
            dark: "#3b92af",
            contrastText: "#ffffff", // text color when using primary
        },
        secondary: {
            main: "#dc004e",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
        error: {
            main: "#d32f2f",
        },
        success: {
            main: "#388e3c",
        },
        text: {
            primary: "#333333",
            secondary: "#555555",
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h5: {
            fontWeight: 600,
        },
        // You can add further typography customization here
    },
    spacing: 8, // default spacing unit (8px)
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AppBar position="static">
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{py: {xs: 1, md: 2}}}>
                        <Typography variant="h6" sx={{flexGrow: 1}}>
                            Open Pool Dashboard: Capacity for the Livepeer Network
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>
            <Container maxWidth="lg" sx={{mt: {xs: 2, md: 4}, mb: {xs: 2, md: 4}}}>
                <Outlet/>
            </Container>
        </ThemeProvider>
    );
}

export default App;
