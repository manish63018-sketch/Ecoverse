'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Sparkles, Search, X } from 'lucide-react';

interface JoinInfo {
  displayName: string;
  city: string;
  roleText: string;
  emoji: string;
  isActive: boolean;
}

export function LiveJoinNotification() {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [joins, setJoins] = useState<JoinInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('notification-hidden');
  
  // Interactive Directory Modal States
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'standby'>('all');

  // 1. Fetch real counts & profiles from Supabase in real-time
  useEffect(() => {
    const fetchRecentAndCount = async () => {
      try {
        const [recentRes, countRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(25),
          supabase.from('profiles').select('id', { count: 'exact', head: true })
        ]);

        if (recentRes.data) {
          const formatted = recentRes.data.map((p: any) => {
            const primaryRole = p.primary_role || (p.roles && p.roles[0]) || 'volunteer';
            let roleText = 'Community Member';
            let emoji = '🌿';
            let isActive = false;

            switch (primaryRole) {
              case 'volunteer':
                roleText = 'Volunteer Helper';
                emoji = '🤝';
                isActive = p.available_now ?? true;
                break;
              case 'vegan':
                roleText = 'Vegan Advocate';
                emoji = '🌱';
                isActive = false;
                break;
              case 'adopter':
                roleText = 'Foster / Adopter';
                emoji = '🏡';
                isActive = false;
                break;
              case 'ngo':
              case 'ngo_staff':
                roleText = 'NGO Partner';
                emoji = '🏥';
                isActive = true;
                break;
              case 'feeder':
              case 'street_feeder':
                roleText = 'Street Feeder';
                emoji = '🥣';
                isActive = false;
                break;
              case 'rescuer':
                roleText = 'Animal Rescuer';
                emoji = '🐾';
                isActive = true;
                break;
            }

            const cityName = p.city_name ? p.city_name.charAt(0).toUpperCase() + p.city_name.slice(1) : 'Unknown';
            return {
              displayName: p.full_name || p.username || 'EcoVerse Member',
              city: cityName,
              roleText,
              emoji,
              isActive,
            };
          });

          setJoins(formatted);
        }

        if (countRes.count !== null) {
          setTotalCount(countRes.count);
        }
      } catch (err) {
        console.warn('Could not fetch profiles from Supabase:', err);
      }
    };

    fetchRecentAndCount();

    // Listen to new profile inserts
    const channel = supabase
      .channel('live-joins')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const p = payload.new;
        const primaryRole = p.primary_role || (p.roles && p.roles[0]) || 'volunteer';
        let roleText = 'Community Member';
        let emoji = '🌿';
        let isActive = false;

        switch (primaryRole) {
          case 'volunteer':
            roleText = 'Volunteer Helper';
            emoji = '🤝';
            isActive = p.available_now ?? true;
            break;
          case 'vegan':
            roleText = 'Vegan Advocate';
            emoji = '🌱';
            isActive = false;
            break;
          case 'adopter':
            roleText = 'Foster / Adopter';
            emoji = '🏡';
            isActive = false;
            break;
          case 'ngo':
          case 'ngo_staff':
            roleText = 'NGO Partner';
            emoji = '🏥';
            isActive = true;
            break;
          case 'feeder':
          case 'street_feeder':
            roleText = 'Street Feeder';
            emoji = '🥣';
            isActive = false;
            break;
          case 'rescuer':
            roleText = 'Animal Rescuer';
            emoji = '🐾';
            isActive = true;
            break;
        }

        const cityName = p.city_name ? p.city_name.charAt(0).toUpperCase() + p.city_name.slice(1) : 'Unknown';
        const newJoin = {
          displayName: p.full_name || p.username || 'EcoVerse Member',
          city: cityName,
          roleText,
          emoji,
          isActive,
        };

        setJoins((prevList) => {
          const alreadyExists = prevList.some(item => item.displayName === newJoin.displayName && item.city === newJoin.city);
          const newList = alreadyExists ? prevList : [newJoin, ...prevList];
          
          const targetIndex = newList.findIndex(item => item.displayName === newJoin.displayName && item.city === newJoin.city);
          setCurrentIndex(targetIndex !== -1 ? targetIndex : 0);
          setVisible(true);
          setAnimationClass('notification-slide-in');

          return newList;
        });

        setTotalCount((prev) => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Loop notifications popup display cycle (for cycling through existing profiles)
  useEffect(() => {
    if (joins.length === 0) return;

    const showNotification = () => {
      setVisible(true);
      setAnimationClass('notification-slide-in');

      const hideTimeout = setTimeout(() => {
        setAnimationClass('notification-slide-out');
        const transitionTimeout = setTimeout(() => {
          setVisible(false);
          setCurrentIndex((prev) => (prev + 1) % joins.length);
        }, 400);
        return () => clearTimeout(transitionTimeout);
      }, 4500);

      return () => clearTimeout(hideTimeout);
    };

    // Initial delay before first popup
    const firstTimeout = setTimeout(showNotification, 2000);

    // Continuous loop: popup every 12 seconds
    const interval = setInterval(showNotification, 12000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [joins, currentIndex]);

  if (joins.length === 0) return null;

  const currentJoin = joins[currentIndex];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const filteredJoins = joins.filter((item) => {
    const matchesSearch =
      item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roleText.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && item.isActive;
    if (activeTab === 'standby') return matchesSearch && !item.isActive;
    return matchesSearch;
  });

  const activeCount = joins.filter((item) => item.isActive).length;
  const standbyCount = joins.filter((item) => !item.isActive).length;

  return (
    <>
      {/* Minimized Pill when popup is hidden */}
      {!visible && !showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="live-status-pill"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9998,
            background: 'rgba(15, 26, 16, 0.85)',
            border: '1px solid rgba(102, 187, 106, 0.35)',
            borderRadius: '30px',
            padding: '8px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontFamily: 'var(--font-sans), sans-serif',
            color: '#E8F5E9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#66BB6A',
              animation: 'pulse-live 1.6s ease infinite',
            }}
          />
          <span>Live Tracker ({totalCount})</span>
        </button>
      )}

      {/* Main Join Notification Card */}
      <div
        className={`live-join-widget ${animationClass}`}
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          maxWidth: '350px',
          width: 'calc(100vw - 48px)',
          background: 'rgba(15, 26, 16, 0.85)',
          border: '1px solid rgba(102, 187, 106, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '16px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          fontFamily: 'var(--font-sans), sans-serif',
          color: '#E8F5E9',
          pointerEvents: 'auto',
          display: visible && !showModal ? 'block' : 'none',
          cursor: 'pointer',
        }}
      >
        {/* Header section with live indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            borderBottom: '1px solid rgba(102, 187, 106, 0.12)',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#66BB6A',
                animation: 'pulse-live 1.6s ease infinite',
              }}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--color-accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Live Activity
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'rgba(165, 200, 167, 0.65)', fontWeight: 600 }}>
            <Users size={11} color="#66BB6A" />
            <span>{totalCount.toLocaleString()} Members</span>
          </div>
        </div>

        {/* User join content card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(102, 187, 106, 0.12)',
              border: '1px solid rgba(102, 187, 106, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              flexShrink: 0,
            }}
          >
            {currentJoin.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(165, 200, 167, 0.65)', fontWeight: 600 }}>
                New member joined!
              </span>
              
              {/* Online/Offline Status Indicator */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.625rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  border: currentJoin.isActive ? '1px solid rgba(102, 187, 106, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: currentJoin.isActive ? 'rgba(102, 187, 106, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  color: currentJoin.isActive ? '#66BB6A' : 'rgba(232, 245, 233, 0.5)',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: currentJoin.isActive ? '#66BB6A' : 'rgba(232, 245, 233, 0.4)',
                    display: 'inline-block',
                  }}
                />
                {currentJoin.isActive ? 'Active Now' : 'Standby'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.4', fontWeight: 600 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{currentJoin.displayName}</span>
              <span style={{ color: 'rgba(232, 245, 233, 0.8)' }}> from </span>
              <span style={{ color: '#A5D6A7', fontWeight: 700 }}>{currentJoin.city}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(165, 200, 167, 0.8)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={10} color="#66BB6A" />
              <span>Joined as {currentJoin.roleText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Directory Modal */}
      {showModal && (
        <div className="community-modal-overlay" onClick={handleOverlayClick}>
          <div className="community-modal-container">
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(102, 187, 106, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(102, 187, 106, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={16} color="#66BB6A" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Community Registry
                  </h3>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(165, 200, 167, 0.65)' }}>
                    Live status tracking across India
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232, 245, 233, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(232, 245, 233, 0.5)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="community-search-wrapper">
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  color: 'rgba(165, 200, 167, 0.5)',
                }}
              >
                <Search size={14} />
              </span>
              <input
                type="text"
                className="community-search-input"
                placeholder="Search by name, city or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="community-tabs">
              <button
                className={`community-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span style={{ fontSize: '0.8rem' }}>{joins.length}</span>
                <span>All Members</span>
              </button>
              <button
                className={`community-tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                <span style={{ fontSize: '0.8rem', color: '#66BB6A' }}>{activeCount}</span>
                <span>Active Now</span>
              </button>
              <button
                className={`community-tab ${activeTab === 'standby' ? 'active' : ''}`}
                onClick={() => setActiveTab('standby')}
              >
                <span style={{ fontSize: '0.8rem', color: 'rgba(232, 245, 233, 0.5)' }}>{standbyCount}</span>
                <span>Standby</span>
              </button>
            </div>

            {/* Member List */}
            <div className="community-member-list">
              {filteredJoins.length > 0 ? (
                filteredJoins.map((item, idx) => (
                  <div key={`${item.displayName}-${idx}`} className="community-member-item">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(102, 187, 106, 0.08)',
                        border: '1px solid rgba(102, 187, 106, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                          {item.displayName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className={item.isActive ? 'status-dot-active' : 'status-dot-standby'} style={{
                            animation: item.isActive ? 'pulse-live 1.6s ease infinite' : 'none'
                          }} />
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: item.isActive ? '#66BB6A' : 'rgba(232, 245, 233, 0.5)',
                            }}
                          >
                            {item.isActive ? 'Active' : 'Standby'}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(165, 200, 167, 0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{item.roleText}</span>
                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                        <span style={{ color: '#A5D6A7', fontWeight: 600 }}>{item.city}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'rgba(165, 200, 167, 0.5)', gap: '8px' }}>
                  <Users size={28} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>No members found matching search</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px 20px',
                borderTop: '1px solid rgba(102, 187, 106, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'rgba(165, 200, 167, 0.65)' }}>
                Showing verified activity stats
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={11} color="#66BB6A" />
                <span>{totalCount.toLocaleString()} Total Network</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .live-join-widget {
          will-change: transform, opacity;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .live-join-widget:hover {
          border-color: rgba(102, 187, 106, 0.5) !important;
          box-shadow: 0 16px 36px rgba(102, 187, 106, 0.15) !important;
        }
        .notification-hidden {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        .notification-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .notification-slide-out {
          animation: slide-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slide-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
        }
        @keyframes pulse-live {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
        @media (max-width: 480px) {
          .live-join-widget {
            bottom: 16px !important;
            left: 16px !important;
            right: 16px !important;
            max-width: none !important;
            width: calc(100vw - 32px) !important;
          }
        }

        /* Modal Backdrop */
        .community-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 10, 5, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          animation: fade-in-overlay 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fade-in-overlay {
          to { opacity: 1; }
        }

        /* Modal Container */
        .community-modal-container {
          background: rgba(10, 20, 11, 0.92);
          border: 1px solid rgba(102, 187, 106, 0.25);
          border-radius: 20px;
          width: 90%;
          max-width: 460px;
          height: 80vh;
          max-height: 580px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-sans), sans-serif;
          color: #E8F5E9;
          transform: scale(0.95) translateY(20px);
          animation: slide-up-modal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slide-up-modal {
          to {
            transform: scale(1) translateY(0);
          }
        }

        /* Search input styling */
        .community-search-wrapper {
          position: relative;
          margin: 12px 16px;
        }
        .community-search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(102, 187, 106, 0.2);
          border-radius: 10px;
          padding: 10px 12px 10px 38px;
          font-size: 0.85rem;
          color: #FFFFFF;
          outline: none;
          transition: all 0.25s ease;
        }
        .community-search-input:focus {
          border-color: #66BB6A;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.15);
        }

        /* Tab styling */
        .community-tabs {
          display: flex;
          gap: 6px;
          padding: 0 16px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(102, 187, 106, 0.1);
          padding-bottom: 12px;
        }
        .community-tab {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 8px 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(232, 245, 233, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .community-tab.active {
          background: rgba(102, 187, 106, 0.12);
          border-color: rgba(102, 187, 106, 0.35);
          color: #FFFFFF;
        }
        .community-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(232, 245, 233, 0.8);
        }

        /* Member list custom scrollbar */
        .community-member-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 16px 16px;
        }
        .community-member-list::-webkit-scrollbar {
          width: 5px;
        }
        .community-member-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .community-member-list::-webkit-scrollbar-thumb {
          background: rgba(102, 187, 106, 0.2);
          border-radius: 4px;
        }
        .community-member-list::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 187, 106, 0.35);
        }

        /* Member Item */
        .community-member-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.03);
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }
        .community-member-item:hover {
          background: rgba(102, 187, 106, 0.05);
          border-color: rgba(102, 187, 106, 0.15);
          transform: translateY(-1px);
        }

        /* Minimized Pill hover effect */
        .live-status-pill {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .live-status-pill:hover {
          transform: scale(1.04) translateY(-2px);
          border-color: #66BB6A !important;
          box-shadow: 0 10px 28px rgba(102, 187, 106, 0.2) !important;
        }

        /* Status Dot styles */
        .status-dot-active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #66BB6A;
          display: inline-block;
          box-shadow: 0 0 8px #66BB6A;
        }
        .status-dot-standby {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          display: inline-block;
        }

        /* Responsive Mobile Drawer */
        @media (max-width: 480px) {
          .community-modal-overlay {
            align-items: flex-end;
          }
          .community-modal-container {
            width: 100%;
            max-width: none;
            height: 82vh;
            max-height: none;
            border-radius: 20px 20px 0 0;
            border-bottom: none;
            transform: translateY(100%);
            animation: slide-up-mobile-drawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }

        @keyframes slide-up-mobile-drawer {
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
