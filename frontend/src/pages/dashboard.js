import { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, issuesRes] = await Promise.all([
        issuesAPI.getStats(),
        issuesAPI.getAll(),
      ]);

      setStats(statsRes.data.stats);
      setLeaderboards(statsRes.data.leaderboards);
      setRecentIssues(issuesRes.data.issues.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Transparency Dashboard</h1>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90 mb-1">Total Issues</div>
            <div className="text-4xl font-bold">{stats.total_issues}</div>
            <div className="text-sm opacity-75 mt-2">
              {stats.resolved_issues} Resolved | {stats.pending_issues} Pending
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90 mb-1">Active Volunteers</div>
            <div className="text-4xl font-bold">{stats.active_volunteers}</div>
            <div className="text-sm opacity-75 mt-2">
              {stats.active_issues} Issues In Progress
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90 mb-1">Total Sponsorship</div>
            <div className="text-4xl font-bold">
              ${parseFloat(stats.total_sponsorship || 0).toFixed(0)}
            </div>
            <div className="text-sm opacity-75 mt-2">
              {stats.active_sponsors} Active Sponsors
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="text-sm opacity-90 mb-1">Resolution Rate</div>
            <div className="text-4xl font-bold">
              {stats.total_issues > 0
                ? Math.round((stats.resolved_issues / stats.total_issues) * 100)
                : 0}
              %
            </div>
            <div className="text-sm opacity-75 mt-2">
              Community Impact Score
            </div>
          </div>
        </div>
      )}

      {/* Leaderboards */}
      {leaderboards && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Top Volunteers */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              Top Volunteers
            </h2>
            {leaderboards.volunteers.length > 0 ? (
              <div className="space-y-3">
                {leaderboards.volunteers.slice(0, 5).map((vol, idx) => (
                  <div key={vol.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary-600">#{idx + 1}</span>
                      <div>
                        <div className="font-medium">{vol.name}</div>
                        <div className="text-xs text-gray-500">
                          {vol.issues_completed} issues completed
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ⭐ {vol.reputation_points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No volunteers yet</p>
            )}
          </div>

          {/* Top Sponsors */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Top Sponsors
            </h2>
            {leaderboards.sponsors.length > 0 ? (
              <div className="space-y-3">
                {leaderboards.sponsors.slice(0, 5).map((sponsor, idx) => (
                  <div key={sponsor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">#{idx + 1}</span>
                      <div>
                        <div className="font-medium">{sponsor.name}</div>
                        <div className="text-xs text-gray-500">
                          {sponsor.issues_sponsored} issues sponsored
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      ${parseFloat(sponsor.total_amount || 0).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No sponsors yet</p>
            )}
          </div>

          {/* Top Reporters */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Top Reporters
            </h2>
            {leaderboards.reporters.length > 0 ? (
              <div className="space-y-3">
                {leaderboards.reporters.slice(0, 5).map((reporter, idx) => (
                  <div key={reporter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-600">#{idx + 1}</span>
                      <div>
                        <div className="font-medium">{reporter.name}</div>
                        <div className="text-xs text-gray-500">
                          {reporter.issues_reported} issues reported
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ⭐ {reporter.reputation_points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reporters yet</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Issues */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Issues</h2>
        {recentIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">No issues reported yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
