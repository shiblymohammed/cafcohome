import { useState } from 'react';
import './Phase2Demo.css';

const EmailCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale 2026',
      status: 'sent',
      sent: '2026-04-15',
      recipients: 2450,
      openRate: 42.5,
      clickRate: 18.3,
      conversions: 89,
      revenue: '₹4,52,000'
    },
    {
      id: 2,
      name: 'New Arrivals - May',
      status: 'scheduled',
      scheduled: '2026-05-05 10:00 AM',
      recipients: 3200,
      openRate: null,
      clickRate: null,
      conversions: null,
      revenue: null
    },
    {
      id: 3,
      name: 'Cart Abandonment - Week 18',
      status: 'draft',
      recipients: 450,
      openRate: null,
      clickRate: null,
      conversions: null,
      revenue: null
    },
    {
      id: 4,
      name: 'VIP Customer Exclusive',
      status: 'sent',
      sent: '2026-04-20',
      recipients: 180,
      openRate: 68.9,
      clickRate: 34.2,
      conversions: 45,
      revenue: '₹8,90,000'
    }
  ];

  const getStatusBadge = (status: string) => {
    const colors: any = {
      sent: 'success',
      scheduled: 'warning',
      draft: 'neutral'
    };
    return <span className={`badge badge-${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>📧 Email Campaigns</h1>
          <p className="phase2-subtitle">Create and manage email marketing campaigns</p>
        </div>
        <button className="btn-primary">
          <span>+</span> Create Campaign
        </button>
      </div>

      <div className="phase2-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-alpha-light)' }}>📊</div>
          <div>
            <div className="stat-value">4</div>
            <div className="stat-label">Total Campaigns</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-beta-light)' }}>📬</div>
          <div>
            <div className="stat-value">6,280</div>
            <div className="stat-label">Total Recipients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-gamma-light)' }}>📈</div>
          <div>
            <div className="stat-value">55.7%</div>
            <div className="stat-label">Avg Open Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>💰</div>
          <div>
            <div className="stat-value">₹13.4L</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="phase2-table-container">
        <table className="phase2-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Conversions</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(campaign => (
              <tr key={campaign.id}>
                <td>
                  <strong>{campaign.name}</strong>
                  {campaign.sent && <div className="text-muted">Sent: {campaign.sent}</div>}
                  {campaign.scheduled && <div className="text-muted">Scheduled: {campaign.scheduled}</div>}
                </td>
                <td>{getStatusBadge(campaign.status)}</td>
                <td>{campaign.recipients.toLocaleString()}</td>
                <td>{campaign.openRate ? `${campaign.openRate}%` : '-'}</td>
                <td>{campaign.clickRate ? `${campaign.clickRate}%` : '-'}</td>
                <td>{campaign.conversions || '-'}</td>
                <td>{campaign.revenue || '-'}</td>
                <td>
                  <button className="btn-icon" onClick={() => setSelectedCampaign(campaign)}>👁️</button>
                  <button className="btn-icon">✏️</button>
                  <button className="btn-icon">📊</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default EmailCampaigns;
