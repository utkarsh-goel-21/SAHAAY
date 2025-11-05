import { useAuth } from '../utils/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResolved, setRecentResolved] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await issuesAPI.getStats();
      setStats(response.data.stats);
      setRecentResolved(response.data.recentResolved);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg p-12 mb-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to Sahaay</h1>
        <p className="text-xl mb-6">
          Transform citizen complaints into community action through volunteer coordination and business sponsorships
        </p>
        {!user && (
          <div className="flex space-x-4">
            <Link href="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
              Get Started
            </Link>
            <Link href="/dashboard" className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600">
              View Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.total_issues}
            </div>
            <div className="text-gray-600">Total Issues</div>
          </div>

          <div className="card text-center">
            <div className="text-4xl font-bold text-success mb-2">
              {stats.resolved_issues}
            </div>
            <div className="text-gray-600">Resolved</div>
          </div>

          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.active_volunteers}
            </div>
            <div className="text-gray-600">Active Volunteers</div>
          </div>

          <div className="card text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${parseFloat(stats.total_sponsorship || 0).toFixed(0)}
            </div>
            <div className="text-gray-600">Total Sponsorship</div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-semibold text-lg mb-2">Report Issue</h3>
            <p className="text-gray-600 text-sm">
              Citizens report civic problems with photos and location
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">AI Categorizes</h3>
            <p className="text-gray-600 text-sm">
              AI automatically categorizes and prioritizes the issue
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">🙋</div>
            <h3 className="font-semibold text-lg mb-2">Volunteers Act</h3>
            <p className="text-gray-600 text-sm">
              Community volunteers pick up and resolve issues
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold text-lg mb-2">Sponsors Support</h3>
            <p className="text-gray-600 text-sm">
              Local businesses sponsor fixes for community goodwill
            </p>
          </div>
        </div>
      </div>

      {/* Recent Resolved Issues */}
      {recentResolved.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Recently Resolved</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentResolved.map((issue) => (
              <div key={issue.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{issue.title}</h3>
                  <span className="badge badge-success">✓ Resolved</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{issue.category}</p>
                {issue.volunteer_name && (
                  <p className="text-xs text-gray-500">
                    Resolved by: {issue.volunteer_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      {!user && (
        <div className="bg-gray-100 rounded-lg p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
          <p className="text-gray-600 mb-6">
            Be part of the solution. Report issues, volunteer your time, or sponsor community fixes.
          </p>
          <Link href="/register" className="btn btn-primary">
            Register Now
          </Link>
        </div>
      )}
    </div>
  );
}
