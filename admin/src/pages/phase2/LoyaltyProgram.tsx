import './Phase2Demo.css';

const LoyaltyProgram = () => {
  const topCustomers = [
    { rank: 1, name: 'Rajesh Kumar', points: 8450, tier: 'Platinum', orders: 24, spent: '₹4,52,000' },
    { rank: 2, name: 'Priya Sharma', points: 6890, tier: 'Gold', orders: 18, spent: '₹3,44,500' },
    { rank: 3, name: 'Amit Patel', points: 5670, tier: 'Gold', orders: 15, spent: '₹2,83,500' },
    { rank: 4, name: 'Sneha Reddy', points: 4320, tier: 'Silver', orders: 12, spent: '₹2,16,000' },
    { rank: 5, name: 'Vikram Singh', points: 3890, tier: 'Silver', orders: 10, spent: '₹1,94,500' }
  ];

  const tiers = [
    { name: 'Bronze', minPoints: 0, customers: 450, color: '#CD7F32', benefits: 'Basic rewards' },
    { name: 'Silver', minPoints: 1000, customers: 120, color: '#C0C0C0', benefits: '5% extra discount' },
    { name: 'Gold', minPoints: 2500, customers: 45, color: '#FFD700', benefits: '10% extra + free shipping' },
    { name: 'Platinum', minPoints: 5000, customers: 12, color: '#E5E4E2', benefits: '15% extra + VIP perks' }
  ];

  const getTierBadge = (tier: string) => {
    const colors: any = {
      Platinum: '#E5E4E2',
      Gold: '#FFD700',
      Silver: '#C0C0C0',
      Bronze: '#CD7F32'
    };
    return (
      <span className="tier-badge" style={{ background: colors[tier], color: '#000' }}>
        {tier}
      </span>
    );
  };

  return (
    <div className="phase2-page">
      <div className="phase2-header">
        <div>
          <h1>⭐ Loyalty Program</h1>
          <p className="phase2-subtitle">Manage customer points and rewards</p>
        </div>
        <button className="btn-primary">
          <span>⚙️</span> Configure Rules
        </button>
      </div>

      <div className="phase2-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-alpha-light)' }}>👥</div>
          <div>
            <div className="stat-value">627</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-beta-light)' }}>⭐</div>
          <div>
            <div className="stat-value">1.2M</div>
            <div className="stat-label">Points Issued</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-gamma-light)' }}>🎁</div>
          <div>
            <div className="stat-value">345K</div>
            <div className="stat-label">Points Redeemed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>💰</div>
          <div>
            <div className="stat-value">₹34.5L</div>
            <div className="stat-label">Rewards Value</div>
          </div>
        </div>
      </div>

      <div className="phase2-grid">
        <div className="phase2-card">
          <h3>🏆 Top Customers</h3>
          <div className="leaderboard">
            {topCustomers.map(customer => (
              <div key={customer.rank} className="leaderboard-item">
                <div className="leaderboard-rank">#{customer.rank}</div>
                <div className="leaderboard-info">
                  <strong>{customer.name}</strong>
                  <div className="text-muted">{customer.orders} orders • {customer.spent}</div>
                </div>
                <div className="leaderboard-points">
                  {getTierBadge(customer.tier)}
                  <strong>{customer.points.toLocaleString()} pts</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="phase2-card">
          <h3>🎯 Tier Distribution</h3>
          <div className="tier-list">
            {tiers.map(tier => (
              <div key={tier.name} className="tier-item">
                <div className="tier-header">
                  <span className="tier-badge" style={{ background: tier.color, color: '#000' }}>
                    {tier.name}
                  </span>
                  <span className="tier-count">{tier.customers} customers</span>
                </div>
                <div className="tier-details">
                  <div className="text-muted">Min: {tier.minPoints} points</div>
                  <div className="text-muted">{tier.benefits}</div>
                </div>
                <div className="tier-progress">
                  <div 
                    className="tier-progress-fill" 
                    style={{ 
                      width: `${(tier.customers / 627) * 100}%`,
                      background: tier.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="phase2-demo-badge">
        🎨 Phase 2 Demo - UI Preview Only
      </div>
    </div>
  );
};

export default LoyaltyProgram;
