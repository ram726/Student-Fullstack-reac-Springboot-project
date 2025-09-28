import React from 'react'
import './Footer.css'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-wave" aria-hidden="true"></div>
      <div className="footer-content">
        <div className="footer-column footer-brand">
          <h3 className="brand-title">Student Management Application</h3>
          <p className="brand-desc">Manage student records with a clean, simple interface.</p>
          <div className="socials" aria-hidden>
            <a className="social" href="https://x.com/iamramranjeet" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"> <path d="M22 5.92c-.66.29-1.37.5-2.12.59.76-.46 1.35-1.2 1.62-2.08-.71.42-1.5.72-2.34.88C18.48 4.28 17.2 3.75 15.82 3.75c-2.35 0-4.26 1.9-4.26 4.26 0 .34.04.67.11.99C7.72 8.82 4.1 6.9 1.67 3.9c-.37.63-.58 1.35-.58 2.12 0 1.47.75 2.77 1.9 3.53-.7-.02-1.36-.21-1.94-.53v.05c0 2.05 1.46 3.76 3.4 4.15-.36.1-.73.15-1.12.15-.27 0-.54-.03-.8-.07.54 1.7 2.11 2.94 3.97 2.97-1.45 1.14-3.27 1.82-5.25 1.82-.34 0-.67-.02-1-.06 1.88 1.2 4.12 1.9 6.52 1.9 7.82 0 12.1-6.48 12.1-12.1v-.55c.83-.6 1.56-1.36 2.13-2.22-.76.34-1.58.57-2.43.68z"/></svg>
            </a>
            <a className="social" href="https://github.com/ram726" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon"> <path d="M12 .5C5.73.5.75 5.48.75 11.78c0 4.9 3.17 9.06 7.57 10.53.55.1.75-.24.75-.53v-1.86c-3.08.66-3.73-1.25-3.73-1.25-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.15 1.68 1.15.97 1.66 2.56 1.18 3.18.9.1-.7.38-1.18.69-1.45-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.12-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 2.78-.38c.94 0 1.88.13 2.78.38 2.12-1.44 3.05-1.14 3.05-1.14.61 1.52.23 2.64.11 2.92.71.78 1.14 1.77 1.14 2.98 0 4.25-2.6 5.2-5.07 5.48.39.34.73 1.02.73 2.06v3.05c0 .3.2.64.76.53 4.4-1.47 7.57-5.63 7.57-10.53C23.25 5.48 18.27.5 12 .5z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-column footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/adduser">Add Student</Link></li>
           
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h4>Contact</h4>
          <address>
            <div>Developer: Ram Ranjeet Kumar</div>
            <div>Email: <a href="mailto:ramranjeet726@gmail.com">ramranjeet726@gmail.com</a></div>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} My Student App &nbsp;•&nbsp; Built with React, Spring Boot and MySQL</div>
      </div>
    </footer>
  )
}
