import React, { useState } from 'react';
import { Camera, User, Package, Heart, ShoppingCart, Save, X } from 'lucide-react';

const Settings = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Alex Morgan',
        email: 'alex.morgan@email.com',
        profileImage: null
    });

    const [stats] = useState({
        orders: 12,
        wishlist: 8,
        cart: 3
    });

    const [tempData, setTempData] = useState({ ...profileData });
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setTempData({ ...tempData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setProfileData(tempData);
        setPreviewImage(null);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempData({ ...profileData });
        setPreviewImage(null);
        setIsEditing(false);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        
        .settings-wrapper {
          font-family: 'DM Sans', sans-serif;
        }
        
        .settings-background {
          min-height: calc(100vh - 80px);
          background: linear-gradient(to bottom right, #f8fafc 0%, #e0e7ff 50%, #ddd6fe 100%);
          padding: 3rem 1.5rem;
        }
        
        .settings-container {
          max-width: 900px;
          margin: 0 auto;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .settings-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        
        .settings-subtitle {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 400;
          margin-bottom: 3rem;
        }
        
        .settings-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        
        .settings-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .settings-card:hover::before {
          opacity: 1;
        }
        
        .settings-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12),
                      0 0 0 1px rgba(255, 255, 255, 0.7);
        }
        
        .settings-profile-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2.5rem;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .settings-avatar-container {
          position: relative;
          flex-shrink: 0;
        }
        
        .settings-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 600;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .settings-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4);
        }
        
        .settings-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .settings-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }
        
        .settings-avatar-container:hover .settings-avatar-overlay {
          opacity: 1;
        }
        
        .settings-input-group {
          margin-bottom: 1.5rem;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        
        .settings-input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .settings-input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
          background: white;
        }
        
        .settings-input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .settings-input-field:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }
        
        .settings-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
        
        .settings-stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 1.75rem;
          border-radius: 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .settings-stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .settings-stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }
        
        .settings-stat-card:hover::before {
          opacity: 1;
        }
        
        .settings-stat-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        
        .settings-stat-number {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
          position: relative;
          z-index: 1;
        }
        
        .settings-stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          z-index: 1;
        }
        
        .settings-button {
          padding: 0.875rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .settings-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .settings-button:hover::before {
          opacity: 1;
        }
        
        .settings-button-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .settings-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .settings-button-primary:active {
          transform: translateY(0);
        }
        
        .settings-button-ghost {
          background: transparent;
          color: #64748b;
          border: 2px solid #e2e8f0;
        }
        
        .settings-button-ghost:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .settings-button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }
        
        .settings-icon-orders {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        
        .settings-icon-wishlist {
          background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
        }
        
        .settings-icon-cart {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        
        @media (max-width: 768px) {
          .settings-background {
            padding: 2rem 1rem;
          }
          
          .settings-header-title {
            font-size: 2.5rem;
          }
          
          .settings-card {
            padding: 1.5rem;
          }
          
          .settings-profile-section {
            flex-direction: column;
            text-align: center;
          }
          
          .settings-button-group {
            flex-direction: column;
          }
          
          .settings-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

            <div className="settings-wrapper">
                <div className="settings-background">
                    <div className="settings-container">
                        <h1 className="settings-header-title">Settings</h1>
                        <p className="settings-subtitle">Manage your profile and account preferences</p>

                        <div className="settings-card">
                            <div className="settings-profile-section">
                                <div className="settings-avatar-container">
                                    <div className="settings-avatar">
                                        {(previewImage || profileData.profileImage) ? (
                                            <img src={previewImage || profileData.profileImage} alt="Profile" />
                                        ) : (
                                            getInitials(isEditing ? tempData.name : profileData.name)
                                        )}
                                    </div>
                                    {isEditing && (
                                        <>
                                            <label htmlFor="profile-upload" className="settings-avatar-overlay">
                                                <Camera size={32} color="white" />
                                            </label>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div className="settings-input-group">
                                        <label className="settings-input-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="settings-input-field"
                                            value={isEditing ? tempData.name : profileData.name}
                                            onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="settings-input-group" style={{ marginBottom: 0 }}>
                                        <label className="settings-input-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="settings-input-field"
                                            value={profileData.email}
                                            disabled
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {!isEditing ? (
                                <div className="settings-button-group">
                                    <button
                                        className="settings-button settings-button-primary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <User size={18} />
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <div className="settings-button-group">
                                    <button
                                        className="settings-button settings-button-primary"
                                        onClick={handleSave}
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                    <button
                                        className="settings-button settings-button-ghost"
                                        onClick={handleCancel}
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                </div>
                            )}

                            <div className="settings-stats-grid">
                                <div className="settings-stat-card">
                                    <div className="settings-stat-icon settings-icon-orders">
                                        <Package size={24} color="white" />
                                    </div>
                                    <div className="settings-stat-number">{stats.orders}</div>
                                    <div className="settings-stat-label">Orders</div>
                                </div>

                                <div className="settings-stat-card">
                                    <div className="settings-stat-icon settings-icon-wishlist">
                                        <Heart size={24} color="white" />
                                    </div>
                                    <div className="settings-stat-number">{stats.wishlist}</div>
                                    <div className="settings-stat-label">Wishlist</div>
                                </div>

                                <div className="settings-stat-card">
                                    <div className="settings-stat-icon settings-icon-cart">
                                        <ShoppingCart size={24} color="white" />
                                    </div>
                                    <div className="settings-stat-number">{stats.cart}</div>
                                    <div className="settings-stat-label">Cart Items</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;