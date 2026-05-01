import { Link } from 'react-router-dom';
import './Phase2Demo.css';

const Phase2Overview = () => {
  const features = [
    {
      id: 'coupons',
      icon: '🎟️',
      title: 'Coupons & Discounts',
      description: 'Create and manage discount codes, track usage, and analyze performance',
      path: '/phase2/coupons',
      status: 'Ready',
      color: 'var(--color-alpha)'
    },
    {
      id: 'reviews',
      icon: '⭐',
      title: 'Product Reviews',
      description: 'Moderate customer reviews, respond to feedback, and showcase testimonials',
      path: '/phase2/reviews',
      status: 'Ready',
      color: 'var(--color-beta)'
    },
    {
      id: 'loyalty',
      icon: '🏆',
      title: 'Loyalty Program',
      description: 'Manage customer points, tiers, and rewards to increase retention',
      path: '/phase2/loyalty',
      status: 'Ready',
      color: 'var(--color-gamma)'
    },
    {
      id: 'email',
      icon: '📧',
      title: 'Email Campaigns',
      description: 'Create targeted email campaigns with analytics and A/B testing',
      path: '/phase2/email-campaigns',
      status: 'Ready',
      color: 'var(--color-delta)'
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive business insights, reports, and data visualization',
      path: '/phase2/analytics',
      status: 'Ready',
      color: 'var(--color-epsilon)'
    },
    {
      id: 'automation',
      icon: '🤖',
      title: 'Automation (n8n)',
      description: 'Monitor automated workflows for cart recovery, notifications, and more',
      path: '/phase2/automation',
      status: 'Coming Soon',
      color: 'var(--color-zeta)'
    },
    {
      id: 'chatbot',
      icon: '💬',
      title: 'AI Chatbot',
      description: 'Configure AI-powered customer support chatbot settings',
      path: '/phase2/chatbot',
      status: 'Coming Soon',
      color: 'var(--color-alpha)'
    },
    {
      id: 'push',
      icon: '🔔',
      title: 'Push Notifications',
      description: 'Send targeted push notifications to engage customers',
      path: '/phase2/push-notifications',
      status: 'Coming Soon',
      color: 'var(--color-beta)'
    },
    {
      id: 'whatsapp',
      icon: '💚',
      title: 'WhatsApp Templates',
      description: 'Manage WhatsApp message templates and automation',
      path: '/phase2/whatsapp',
      status: 'Coming Soon',
      color: 'var(--color-gamma)'
    },
    {
      id: 'integrations',
      icon: '🔗',
      title: 'Marketing Integrations',
      description: 'Configure Meta Pixel, Instagram Shopping, and other integrations',
      path: '/phase2/integrations',
      status: 'Coming Soon',
      color: 'var(--color-delta)'
    },
    {
      id: 'referrals',
      icon: '🎁',
      title: 'Referral Program',
      description: 'Track and manage customer referrals and rewards',
      path: '/phase2/referrals',
      status: 'Coming Soon',
      color: 'var(--color-epsilon)'
    },
    {
      id: 'segments',
      icon: '👥',
      title: 'Customer Segments',
      description: 'Create and manage customer segments for targeted marketing',
      path: '/phase2/segments',
      status: 'Coming Soon',
      color: 'var(--color-zeta)'
    }
  ];

  const readyFeatures = features.filter(f => f.status === 'Ready');
  const comingSoon = features.filter(f => f.status === 'Coming Soon');

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>🚀 Phase 2 Features Preview</h1>
          <p className="phase2-subtitle">
            Explore upcoming features for advanced e-commerce automation and marketing
          </p>
        </div>
      </div>

      <div className="phase2-banner">
        <div className="phase2-banner-content">
          <h2>🎨 Demo Environment</h2>
          <p>
            This is a preview of Phase 2 features with sample data and UI mockups. 
            These features are planned for implementation and will include full functionality 
            with real data integration.
          </p>
          <div className="phase2-banner-stats">
            <div>
              <strong>{readyFeatures.length}</strong>
              <span>UI Previews Ready</span>
            </div>
            <div>
              <strong>{comingSoon.length}</strong>
              <span>Coming Soon</span>
            </div>
            <div>
              <strong>7-10 weeks</strong>
              <span>Estimated Timeline</span>
            </div>
          </div>
        </div>
      </div>

      <div className="phase2-section">
        <h2>✅ Available Previews</h2>
        <div className="features-grid">
          {readyFeatures.map(feature => (
            <Link 
              key={feature.id} 
              to={feature.path} 
              className="feature-card"
              style={{ '--feature-color': feature.color } as any}
            >
              <div className="feature-icon" style={{ background: `${feature.color}20` }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-status ready">
                <span className="status-dot"></span>
                {feature.status}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="phase2-section">
        <h2>🔜 Coming Soon</h2>
        <div className="features-grid">
          {comingSoon.map(feature => (
            <div 
              key={feature.id} 
              className="feature-card disabled"
              style={{ '--feature-color': feature.color } as any}
            >
              <div className="feature-icon" style={{ background: `${feature.color}20` }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-status coming-soon">
                <span className="status-dot"></span>
                {feature.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="phase2-info-cards">
        <div className="info-card">
          <h3>📋 Implementation Plan</h3>
          <ul>
            <li><strong>Phase 2A:</strong> Marketing Essentials (3-4 weeks)</li>
            <li><strong>Phase 2B:</strong> Customer Engagement (2-3 weeks)</li>
            <li><strong>Phase 2C:</strong> Automation & AI (2-3 weeks)</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>💰 Investment</h3>
          <ul>
            <li><strong>Development:</strong> ₹2,00,000 - ₹3,50,000</li>
            <li><strong>Timeline:</strong> 7-10 weeks</li>
            <li><strong>ROI:</strong> 15-25% revenue increase</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>🎯 Key Benefits</h3>
          <ul>
            <li>Automated customer engagement</li>
            <li>Data-driven decision making</li>
            <li>Increased customer retention</li>
            <li>Higher conversion rates</li>
          </ul>
        </div>
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default Phase2Overview;
