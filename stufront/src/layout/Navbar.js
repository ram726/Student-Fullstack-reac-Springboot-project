import React from 'react'
import { Link } from 'react-router-dom';

export default function navbar() {
  return (
    <div>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <h3>
            <Link to="/" className="navbar-brand mx-3">Student Management Application</Link></h3>
        </div>
        <Link to="/adduser" className="btn btn-dark btn-sm mx-5">New Student</Link>
      </nav>
    </div>
  )
}
