import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { MyProvider } from './context/Context.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <MyProvider>
        <App />
      </MyProvider>
    </AuthProvider>
  </BrowserRouter>,
)
