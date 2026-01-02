import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

function ProtectedRoute({ children }) {

  let user  = JSON.parse(localStorage.getItem('user'))

  // const navigate = useNavigate()

  if (!user) {
    return <Navigate to={'/signup'} />
  }

  if (user && user.role !== 'admin') {
    return <Navigate to={'/'} />
  }

  
  return children
  
}

export default ProtectedRoute