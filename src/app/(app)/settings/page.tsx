'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    shares: true,
    follows: true,
    playlists: true,
    diary: false,
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Name</span>
            <span className="settings-value">Vivek</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Email</span>
            <span className="settings-value">vivek@email.com</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Username</span>
            <span className="settings-value">@vivek</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h2 className="settings-section-title">Notifications</h2>
        <div className="settings-card">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="settings-row">
              <span className="settings-label" style={{ textTransform: 'capitalize' }}>{key}</span>
              <button
                type="button"
                className={`settings-toggle ${value ? 'is-on' : ''}`}
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !value }))}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Services */}
      <div className="settings-section">
        <h2 className="settings-section-title">Connected Services</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Spotify</span>
            <button className="settings-connect-btn" type="button">Connect</button>
          </div>
          <div className="settings-row">
            <span className="settings-label">Apple Music</span>
            <button className="settings-connect-btn" type="button">Connect</button>
          </div>
          <div className="settings-row">
            <span className="settings-label">Last.fm</span>
            <button className="settings-connect-btn" type="button">Connect</button>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="settings-section">
        <h2 className="settings-section-title">Privacy</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Profile visibility</span>
            <span className="settings-value">Public</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Listening activity</span>
            <span className="settings-value">Friends only</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h2 className="settings-section-title">About</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">1.0.0</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Made with</span>
            <span className="settings-value">♥ in India</span>
          </div>
        </div>
      </div>
    </div>
  )
}
