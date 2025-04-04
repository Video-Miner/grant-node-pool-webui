import React from "react";

const Card = ({children}) => (
    <div className="dashboard-card">{children}</div>
);

const CardHeader = ({children, className = ""}) => (
    <div className={`dashboard-card-header ${className}`}>{children}</div>
);

const CardTitle = ({children, className = ""}) => (
    <h3 className={`dashboard-card-title ${className}`}>{children}</h3>
);

const CardContent = ({children}) => <div className="dashboard-card-content">{children}</div>;

export {Card, CardHeader, CardTitle, CardContent};
