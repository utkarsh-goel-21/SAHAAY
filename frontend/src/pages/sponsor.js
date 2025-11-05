import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/router';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';

export default function Sponsor() {
  const { user } = useAuth();
  const router = useRouter();
  const [availableIssues, setAvailableIssues] = useState([]);
  const [sponsoredIssues, setSponsoredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [sponsorAmount, setSponsorAmount] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'sponsor') {
      router.push('/');
      return;
    }
    fetchIssues();
  }, [user, router]);

  const fetchIssues = async () => {
    try {
      const [allIssuesRes, sponsoredRes] = await Promise.all([
        issuesAPI.getAll(),
        issuesAPI.getAll({ sponsored_by: user.id }),
      ]);

      // Filter out already sponsored issues
      const unsponsored = allIssuesRes.data.issues.filter(
        (issue) => !issue.sponsored_by
      );

      setAvailableIssues(unsponsored);
      setSponsoredIssues(sponsoredRes.data.issues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsor = async (issueId) => {
    const amount = sponsorAmount[issueId];

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await issuesAPI.sponsorIssue(issueId, parseFloat(amount));
      alert('Issue sponsored successfully!');
      setSponsorAmount({ ...sponsorAmount, [issueId]: '' });
      fetchIssues();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to sponsor issue');
    }
  };

  if (!user || loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const totalSponsored = sponsoredIssues.reduce(
    (sum, issue) => sum + parseFloat(issue.sponsor_amount || 0),
    0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Sponsor Dashboard</h1>
        <div className="text-sm text-gray-600 text-right">
          <div className="font-medium text-lg">{user.name}</div>
          <div className="text-green-600 font-bold">
            Total Sponsored: ${totalSponsored.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90 mb-1">Issues Sponsored</div>
          <div className="text-4xl font-bold">{sponsoredIssues.length}</div>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90 mb-1">Total Investment</div>
          <div className="text-4xl font-bold">${totalSponsored.toFixed(0)}</div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-sm opacity-90 mb-1">Community Impact</div>
          <div className="text-4xl font-bold">⭐ {user.reputation_points || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'available'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available to Sponsor ({availableIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('sponsored')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'sponsored'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Sponsored Issues ({sponsoredIssues.length})
          </button>
        </div>
      </div>

      {/* Available to Sponsor Tab */}
      {activeTab === 'available' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Issues Seeking Sponsorship</h2>
          {availableIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showActions
                  onAction={
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Amount ($)"
                        value={sponsorAmount[issue.id] || ''}
                        onChange={(e) =>
                          setSponsorAmount({
                            ...sponsorAmount,
                            [issue.id]: e.target.value,
                          })
                        }
                        className="input text-sm"
                        min="1"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleSponsor(issue.id)}
                        className="btn btn-success w-full"
                      >
                        💰 Sponsor This Fix
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">All issues are currently sponsored</p>
            </div>
          )}
        </div>
      )}

      {/* Sponsored Issues Tab */}
      {activeTab === 'sponsored' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Issues I've Sponsored</h2>
          {sponsoredIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsoredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">You haven't sponsored any issues yet</p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn btn-primary mt-4"
              >
                Browse Issues to Sponsor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
