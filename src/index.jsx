import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from 'react-router-dom';
import App from './App';
import Dashboard from "./routes/Dashboard.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App/>}>
            <Route index element={<Dashboard/>}/>
        </Route>
    )
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
);
