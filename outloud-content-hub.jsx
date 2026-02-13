import React, { useState } from 'react';

// Outloud Content Hub MVP - Interactive Mockup
// Brand: Calm Premium Confidence | Precise / Premium / Pragmatic
// Colors: #0A0A0A (bg), Orange gradient (#E85A2C → #8B2E1A), White text

const OutloudContentHub = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('tade'); // tade, martin, ondrej

  // Mock data
  const posts = {
    draft: [
      { 
        id: 1, 
        title: 'Questim case study – one team built everything',
        platform: 'linkedin',
        account: 'Outloud',
        aiScore: 73,
        tovScore: 89,
        comments: 2,
        hasCreative: true,
        creativeApproved: false,
        author: 'Tade'
      },
      { 
        id: 2, 
        title: 'Why we don\'t do discovery calls anymore',
        platform: 'x',
        account: 'Ondrej',
        aiScore: 12,
        tovScore: 94,
        comments: 0,
        hasCreative: false,
        creativeApproved: false,
        author: 'Tade'
      },
    ],
    design: [
      { 
        id: 3, 
        title: 'IDS BK – tickets without registration',
        platform: 'x',
        account: 'Outloud',
        aiScore: 28,
        tovScore: 91,
        comments: 4,
        hasCreative: true,
        creativeApproved: false,
        waitingFor: 'Martin',
        author: 'Tade'
      },
      { 
        id: 4, 
        title: 'Hiring senior designers who ship',
        platform: 'linkedin',
        account: 'Outloud',
        aiScore: 22,
        tovScore: 88,
        comments: 2,
        hasCreative: true,
        creativeApproved: false,
        waitingFor: 'Martin',
        author: 'Tade'
      },
    ],
    final: [
      { 
        id: 5, 
        title: 'SaaS scaling lessons after 7 figures',
        platform: 'linkedin',
        account: 'Ondrej',
        aiScore: 18,
        tovScore: 94,
        comments: 1,
        hasCreative: true,
        creativeApproved: true,
        waitingFor: 'Ondrej',
        author: 'Tade'
      },
    ],
    scheduled: [
      { 
        id: 6, 
        title: 'Behind the scenes: Questim game design',
        platform: 'instagram',
        account: 'Outloud',
        aiScore: 15,
        tovScore: 92,
        comments: 0,
        hasCreative: true,
        creativeApproved: true,
        scheduledDate: 'Feb 15',
        scheduledTime: '10:00',
        author: 'Tade'
      },
      { 
        id: 7, 
        title: 'Full case study: Questim from 0 to launch',
        platform: 'linkedin',
        account: 'Outloud',
        aiScore: 19,
        tovScore: 96,
        comments: 0,
        hasCreative: true,
        creativeApproved: true,
        scheduledDate: 'Feb 17',
        scheduledTime: '14:00',
        author: 'Tade'
      },
    ]
  };

  const users = {
    tade: { name: 'Tade', initial: 'T', color: '#E85A2C', role: 'Head of Media' },
    martin: { name: 'Martin', initial: 'M', color: '#3B82F6', role: 'Designer' },
    ondrej: { name: 'Ondrej', initial: 'O', color: '#8B5CF6', role: 'CEO' }
  };

  const platformColors = {
    linkedin: { bg: '#0A66C2', label: 'LI' },
    x: { bg: '#1D1D1D', label: '𝕏' },
    instagram: { bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', label: 'IG' }
  };

  const getAiScoreStatus = (score) => {
    if (score >= 60) return { icon: '⚠️', color: '#FFB800', label: 'Rewrite needed' };
    if (score >= 30) return { icon: '◐', color: '#9A9A9A', label: 'Review suggested' };
    return { icon: '✓', color: '#34C759', label: 'Looks human' };
  };

  const getTovScoreStatus = (score) => {
    if (score >= 85) return { icon: '✓', color: '#34C759', label: 'On brand' };
    if (score >= 70) return { icon: '◐', color: '#FFB800', label: 'Minor tweaks' };
    return { icon: '✗', color: '#FF3B30', label: 'Off brand' };
  };

  // Components
  const Avatar = ({ user, size = 32 }) => (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: users[user]?.color || '#2A2A2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0
      }}
    >
      {users[user]?.initial || '?'}
    </div>
  );

  const PlatformBadge = ({ platform }) => (
    <div style={{
      padding: '4px 8px',
      borderRadius: 4,
      background: platformColors[platform]?.bg || '#2A2A2A',
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }}>
      {platformColors[platform]?.label}
    </div>
  );

  const StatusPill = ({ icon, label, color }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      color: color,
      background: `${color}15`,
      padding: '3px 8px',
      borderRadius: 12
    }}>
      <span>{icon}</span>
      <span style={{ opacity: 0.9 }}>{label}</span>
    </div>
  );

  const PostCard = ({ post, onClick }) => {
    const aiStatus = getAiScoreStatus(post.aiScore);
    const tovStatus = getTovScoreStatus(post.tovScore);
    
    return (
      <div 
        onClick={() => onClick(post)}
        style={{
          background: '#141414',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = '1px solid #E85A2C40';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '1px solid transparent';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <PlatformBadge platform={post.platform} />
          <span style={{ fontSize: 12, color: '#9A9A9A' }}>{post.account}</span>
        </div>
        
        {/* Title */}
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: 14, 
          fontWeight: 500,
          color: '#fff',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {post.title}
        </h4>
        
        {/* Status indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <StatusPill icon={aiStatus.icon} label={`AI ${post.aiScore}%`} color={aiStatus.color} />
          <StatusPill icon={tovStatus.icon} label={`ToV ${post.tovScore}%`} color={tovStatus.color} />
        </div>
        
        {/* Waiting indicator */}
        {post.waitingFor && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            fontSize: 11, 
            color: post.waitingFor === 'Ondrej' ? '#8B5CF6' : '#FFB800',
            marginBottom: 8
          }}>
            <span>{post.waitingFor === 'Ondrej' ? '👤' : '🖼️'}</span>
            <span>Waiting for {post.waitingFor}</span>
          </div>
        )}
        
        {/* Scheduled date */}
        {post.scheduledDate && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            fontSize: 12, 
            color: '#34C759',
            marginBottom: 8
          }}>
            <span>📅</span>
            <span>{post.scheduledDate}, {post.scheduledTime}</span>
          </div>
        )}
        
        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid #2A2A2A'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar user="tade" size={20} />
            <span style={{ fontSize: 11, color: '#9A9A9A' }}>{post.author}</span>
          </div>
          {post.comments > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              fontSize: 11, 
              color: '#9A9A9A' 
            }}>
              <span>💬</span>
              <span>{post.comments}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const KanbanColumn = ({ title, count, posts, accentColor }) => (
    <div style={{ 
      flex: 1, 
      minWidth: 280,
      maxWidth: 320
    }}>
      {/* Column Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `2px solid ${accentColor || '#2A2A2A'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: 13, 
            fontWeight: 600,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {title}
          </h3>
          <span style={{
            background: '#2A2A2A',
            color: '#9A9A9A',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 10,
            fontWeight: 500
          }}>
            {count}
          </span>
        </div>
      </div>
      
      {/* Cards */}
      <div style={{ minHeight: 200 }}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} onClick={setSelectedPost} />
        ))}
      </div>
    </div>
  );

  const Sidebar = () => (
    <div style={{
      width: 64,
      background: '#0A0A0A',
      borderRight: '1px solid #1A1A1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: 8
    }}>
      {/* Logo */}
      <div style={{
        width: 40,
        height: 40,
        background: 'linear-gradient(135deg, #E85A2C, #8B2E1A)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        fontSize: 18,
        fontWeight: 700,
        color: '#fff'
      }}>
        O
      </div>
      
      {/* Nav items */}
      {[
        { id: 'dashboard', icon: '◫', label: 'Dashboard' },
        { id: 'posts', icon: '✎', label: 'Posts' },
        { id: 'calendar', icon: '▦', label: 'Calendar' },
        { id: 'plan', icon: '☰', label: 'Content Plan' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          style={{
            width: 44,
            height: 44,
            border: 'none',
            background: activeTab === item.id ? '#1A1A1A' : 'transparent',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: activeTab === item.id ? '#E85A2C' : '#6A6A6A',
            transition: 'all 0.2s ease'
          }}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
      
      {/* Spacer */}
      <div style={{ flex: 1 }} />
      
      {/* Settings */}
      <button
        style={{
          width: 44,
          height: 44,
          border: 'none',
          background: 'transparent',
          borderRadius: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: '#6A6A6A'
        }}
      >
        ⚙
      </button>
      
      {/* User avatar */}
      <div style={{ marginTop: 8 }}>
        <Avatar user={currentUser} size={36} />
      </div>
    </div>
  );

  const Header = () => (
    <div style={{
      height: 64,
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1A1A1A'
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 20, 
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.02em'
        }}>
          Content Hub
        </h1>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{
            background: '#141414',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer'
          }}>
            <option>All Accounts</option>
            <option>Outloud</option>
            <option>Ondrej</option>
          </select>
          <select style={{
            background: '#141414',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer'
          }}>
            <option>This Week</option>
            <option>This Month</option>
            <option>All Time</option>
          </select>
        </div>
      </div>
      
      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: 8,
          padding: '8px 12px'
        }}>
          <span style={{ color: '#6A6A6A' }}>⌕</span>
          <input 
            placeholder="Search posts..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 13,
              width: 160,
              outline: 'none'
            }}
          />
          <span style={{ color: '#4A4A4A', fontSize: 11 }}>⌘K</span>
        </div>
        
        {/* New post button */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #E85A2C, #C44A24)',
          border: 'none',
          borderRadius: 8,
          padding: '10px 16px',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 16 }}>+</span>
          New Post
        </button>
      </div>
    </div>
  );

  const PostDetailPanel = ({ post, onClose }) => {
    if (!post) return null;
    
    const aiStatus = getAiScoreStatus(post.aiScore);
    const tovStatus = getTovScoreStatus(post.tovScore);
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '55%',
        maxWidth: 720,
        height: '100vh',
        background: '#0F0F0F',
        borderLeft: '1px solid #1A1A1A',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.25s ease'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #1A1A1A'
        }}>
          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              color: '#9A9A9A',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer'
            }}>
              Save Draft
            </button>
            <button style={{
              background: 'linear-gradient(135deg, #E85A2C, #C44A24)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Submit for Review →
            </button>
          </div>
        </div>
        
        {/* Panel Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Title */}
          <h2 style={{ 
            margin: '0 0 24px 0', 
            fontSize: 22, 
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.3
          }}>
            {post.title}
          </h2>
          
          {/* Platform & Account */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 24,
            padding: 16,
            background: '#141414',
            borderRadius: 10
          }}>
            <PlatformBadge platform={post.platform} />
            <span style={{ color: '#fff', fontSize: 14 }}>{post.account}</span>
            <span style={{ color: '#4A4A4A' }}>•</span>
            <span style={{ color: '#9A9A9A', fontSize: 13 }}>
              {post.scheduledDate ? `${post.scheduledDate}, ${post.scheduledTime}` : 'Not scheduled'}
            </span>
          </div>
          
          {/* Content Editor */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              color: '#9A9A9A', 
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Content
            </label>
            <textarea 
              defaultValue={`Questim needed a name, a brand, a game, a mobile app, a tournament system, an advertising platform, a back-office, and anti-cheat protection.

They hired one team.

16 months later: live in CZ/SK, 4 prize tournaments with €17,000+ in real rewards, and 2,000+ competing players. No entry fees. No forced ads. No scam vibes.

We took this project from a blank page (literally — no name existed when we started) through brand identity, product design, Flutter development, in-app game creation with Flame engine, and a full management system for tournaments, advertisers, players, and prize fulfillment.

One product. One team. Everything connected.

Full case study on our site.`}
              style={{
                width: '100%',
                minHeight: 200,
                background: '#141414',
                border: '1px solid #2A2A2A',
                borderRadius: 10,
                padding: 16,
                color: '#fff',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: 8,
              color: '#6A6A6A',
              fontSize: 12
            }}>
              1,847 characters
            </div>
          </div>
          
          {/* AI & ToV Checks */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16, 
            marginBottom: 24 
          }}>
            {/* AI Check */}
            <div style={{
              background: '#141414',
              borderRadius: 10,
              padding: 16,
              border: `1px solid ${aiStatus.color}30`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <span style={{ fontSize: 12, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Detection
                </span>
                <span style={{ fontSize: 11, color: aiStatus.color }}>{aiStatus.label}</span>
              </div>
              <div style={{ 
                fontSize: 28, 
                fontWeight: 600, 
                color: aiStatus.color,
                marginBottom: 12
              }}>
                {aiStatus.icon} {post.aiScore}%
              </div>
              <div style={{ fontSize: 12, color: '#9A9A9A', lineHeight: 1.5 }}>
                Flagged phrases: <span style={{ color: '#FFB800' }}>"delivers top-tier"</span>, <span style={{ color: '#FFB800' }}>"seamless"</span>
              </div>
            </div>
            
            {/* ToV Check */}
            <div style={{
              background: '#141414',
              borderRadius: 10,
              padding: 16,
              border: `1px solid ${tovStatus.color}30`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <span style={{ fontSize: 12, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tone of Voice
                </span>
                <span style={{ fontSize: 11, color: tovStatus.color }}>{tovStatus.label}</span>
              </div>
              <div style={{ 
                fontSize: 28, 
                fontWeight: 600, 
                color: tovStatus.color,
                marginBottom: 12
              }}>
                {tovStatus.icon} {post.tovScore}%
              </div>
              <div style={{ fontSize: 12, color: '#9A9A9A', lineHeight: 1.5 }}>
                Minor: Consider more specific numbers
              </div>
            </div>
          </div>
          
          {/* Recheck button */}
          <button style={{
            width: '100%',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: '12px',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: 24
          }}>
            ↻ Re-check AI & ToV
          </button>
          
          {/* Creative */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              color: '#9A9A9A', 
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Creative
            </label>
            <div style={{
              display: 'flex',
              gap: 12
            }}>
              <div style={{
                width: 120,
                height: 120,
                background: '#1A1A1A',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #2A2A2A'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  color: '#6A6A6A'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
                  <div style={{ fontSize: 11 }}>questim-hero.jpg</div>
                </div>
              </div>
              <div style={{
                width: 120,
                height: 120,
                background: '#141414',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #2A2A2A',
                cursor: 'pointer'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  color: '#6A6A6A'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>+</div>
                  <div style={{ fontSize: 11 }}>Add more</div>
                </div>
              </div>
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              color: post.creativeApproved ? '#34C759' : '#FFB800',
              fontSize: 12
            }}>
              {post.creativeApproved ? '✓' : '⏳'}
              {post.creativeApproved ? 'Creative approved by Martin' : 'Waiting for Martin\'s approval'}
            </div>
          </div>
          
          {/* Comments */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              color: '#9A9A9A', 
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Comments ({post.comments})
            </label>
            
            {/* Comment thread */}
            <div style={{ 
              background: '#141414', 
              borderRadius: 10, 
              padding: 16 
            }}>
              {/* Comment 1 */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Avatar user="ondrej" size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 4 
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Ondrej</span>
                    <span style={{ fontSize: 11, color: '#6A6A6A' }}>2 hours ago</span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 13, 
                    color: '#CACACA', 
                    lineHeight: 1.5 
                  }}>
                    "They hired one team" – love this line. But the ending feels weak. Can we add a clearer CTA?
                  </p>
                </div>
              </div>
              
              {/* Comment 2 */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Avatar user="tade" size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 4 
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Tade</span>
                    <span style={{ fontSize: 11, color: '#6A6A6A' }}>1 hour ago</span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 13, 
                    color: '#CACACA', 
                    lineHeight: 1.5 
                  }}>
                    Good point. Updated – check the new version.
                  </p>
                </div>
              </div>
              
              {/* Add comment */}
              <div style={{ 
                display: 'flex', 
                gap: 12, 
                paddingTop: 16, 
                borderTop: '1px solid #2A2A2A' 
              }}>
                <Avatar user={currentUser} size={32} />
                <input 
                  placeholder="Add comment..."
                  style={{
                    flex: 1,
                    background: '#0A0A0A',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Activity Log */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              color: '#9A9A9A', 
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Activity
            </label>
            <div style={{ fontSize: 12, color: '#6A6A6A', lineHeight: 2 }}>
              <div>Feb 13, 14:30 · Tade created draft</div>
              <div>Feb 13, 15:45 · AI Check: 73% detected</div>
              <div>Feb 13, 16:00 · Tade updated content</div>
              <div>Feb 14, 09:15 · Martin approved creative</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Role-specific views
  const renderMartinView = () => (
    <div style={{ padding: 32 }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: 24, 
        fontWeight: 600, 
        color: '#fff' 
      }}>
        Design Review Queue
      </h2>
      <p style={{ 
        margin: '0 0 32px 0', 
        fontSize: 14, 
        color: '#9A9A9A' 
      }}>
        {posts.design.length} posts waiting for creative approval
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.design.map(post => (
          <div key={post.id} style={{
            background: '#141414',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #2A2A2A'
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {/* Image preview */}
              <div style={{
                width: 120,
                height: 120,
                background: '#1A1A1A',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: 32 }}>🖼️</span>
              </div>
              
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <PlatformBadge platform={post.platform} />
                  <span style={{ fontSize: 12, color: '#9A9A9A' }}>{post.account}</span>
                </div>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: 16, 
                  fontWeight: 500, 
                  color: '#fff' 
                }}>
                  {post.title}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  fontSize: 12, 
                  color: '#9A9A9A' 
                }}>
                  Requested by {post.author} · Feb 13
                </div>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={() => setSelectedPost(post)}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                    padding: '10px 20px',
                    color: '#fff',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  View Post
                </button>
                <button style={{
                  background: '#34C75920',
                  border: '1px solid #34C75940',
                  borderRadius: 8,
                  padding: '10px 20px',
                  color: '#34C759',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  ✓ Approve
                </button>
                <button style={{
                  background: '#FF3B3020',
                  border: '1px solid #FF3B3040',
                  borderRadius: 8,
                  padding: '10px 20px',
                  color: '#FF3B30',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOndrejView = () => (
    <div style={{ padding: 32 }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: 24, 
        fontWeight: 600, 
        color: '#fff' 
      }}>
        Final Review
      </h2>
      <p style={{ 
        margin: '0 0 32px 0', 
        fontSize: 14, 
        color: '#9A9A9A' 
      }}>
        {posts.final.length} post{posts.final.length !== 1 ? 's' : ''} ready for final approval
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.final.map(post => {
          const aiStatus = getAiScoreStatus(post.aiScore);
          const tovStatus = getTovScoreStatus(post.tovScore);
          
          return (
            <div key={post.id} style={{
              background: '#141414',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #2A2A2A'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <PlatformBadge platform={post.platform} />
                <span style={{ fontSize: 13, color: '#9A9A9A' }}>{post.account}</span>
              </div>
              
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: 18, 
                fontWeight: 500, 
                color: '#fff' 
              }}>
                {post.title}
              </h3>
              
              {/* Preview */}
              <div style={{
                background: '#0A0A0A',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                border: '1px solid #1A1A1A'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  color: '#CACACA', 
                  lineHeight: 1.6 
                }}>
                  "We hit 7 figures without VC money. Here's what actually worked – the decisions, the tradeoffs, and the things we'd do differently..."
                </p>
              </div>
              
              {/* Status */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                marginBottom: 20 
              }}>
                <StatusPill icon={aiStatus.icon} label={`AI ${post.aiScore}%`} color={aiStatus.color} />
                <StatusPill icon={tovStatus.icon} label={`ToV ${post.tovScore}%`} color={tovStatus.color} />
                <StatusPill icon="✓" label="Creative approved" color="#34C759" />
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setSelectedPost(post)}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                    padding: '12px 20px',
                    color: '#fff',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #34C759, #28A745)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 20px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  ✓ Approve
                </button>
                <button style={{
                  background: '#FF3B3020',
                  border: '1px solid #FF3B3040',
                  borderRadius: 8,
                  padding: '12px 20px',
                  color: '#FF3B30',
                  fontSize: 13,
                  cursor: 'pointer'
                }}>
                  Return for Edits
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: 32, display: 'flex', gap: 24, overflow: 'auto' }}>
      <KanbanColumn 
        title="Draft" 
        count={posts.draft.length} 
        posts={posts.draft}
        accentColor="#6A6A6A"
      />
      <KanbanColumn 
        title="Design Review" 
        count={posts.design.length} 
        posts={posts.design}
        accentColor="#3B82F6"
      />
      <KanbanColumn 
        title="Final Review" 
        count={posts.final.length} 
        posts={posts.final}
        accentColor="#8B5CF6"
      />
      <KanbanColumn 
        title="Scheduled" 
        count={posts.scheduled.length} 
        posts={posts.scheduled}
        accentColor="#34C759"
      />
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0A0A0A',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Header />
        
        {/* Role switcher (for demo) */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          padding: '12px 32px',
          borderBottom: '1px solid #1A1A1A',
          background: '#0A0A0A'
        }}>
          <span style={{ fontSize: 12, color: '#6A6A6A', marginRight: 8 }}>View as:</span>
          {Object.entries(users).map(([key, user]) => (
            <button
              key={key}
              onClick={() => setCurrentUser(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: currentUser === key ? '#1A1A1A' : 'transparent',
                border: currentUser === key ? '1px solid #2A2A2A' : '1px solid transparent',
                borderRadius: 6,
                padding: '6px 12px',
                color: currentUser === key ? '#fff' : '#6A6A6A',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <Avatar user={key} size={18} />
              {user.name}
              <span style={{ 
                fontSize: 10, 
                color: '#4A4A4A',
                marginLeft: 4
              }}>
                {user.role}
              </span>
            </button>
          ))}
        </div>
        
        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentUser === 'martin' ? renderMartinView() :
           currentUser === 'ondrej' ? renderOndrejView() :
           renderDashboard()}
        </div>
      </div>
      
      {/* Post detail panel */}
      {selectedPost && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedPost(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 99
            }}
          />
          <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />
        </>
      )}
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        input::placeholder, textarea::placeholder {
          color: #4A4A4A;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #2A2A2A;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #3A3A3A;
        }
      `}</style>
    </div>
  );
};

export default OutloudContentHub;
