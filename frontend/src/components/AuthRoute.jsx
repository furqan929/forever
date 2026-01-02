import React from 'react';
import { Navigate } from 'react-router-dom';

// This route will prevent logged-in users from accessing login/signup
function AuthRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));

    // If user is logged in, redirect to home
    if (user) {
        return <Navigate to="/" />;
    }

    // Otherwise, render the page (login/signup)
    return children;
}

export default AuthRoute;
