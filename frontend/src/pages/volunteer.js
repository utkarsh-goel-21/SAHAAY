import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/router';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';

export default function Volunteer() {
  const { user } = useAuth();
  const router = useRouter();
  const [availableIssues, setAvailableIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (!user || user.role !== 'volunteer') {
      router.push('/');
      return;
    }
    fetchIssues();
  }, [user, router]);

  const fetchIssues = async () => {
    try {
      const [availableRes, myIssuesRes] = await Promise.all([
        issuesAPI.getAll({ status: 'Reported' }),
        issuesAPI.getAll({ assigned_to: user.id }),
      ]);

      setAvailableIssues(availableRes.data.issues);
      setMyIssues(myIssuesRes.data.issues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickIssue = async (issueId) => {
    try {
      await issuesAPI.pickIssue(issueId);
      alert('Issue assigned successfully!');
      fetchIssues();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to pick issue');
    }
  };

  if (!user || loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Volunteer Dashboard</h1>
        <div className="text-sm text-gray-600">
          <div className="font-medium text-lg">{user.name}</div>
          <div>Reputation: ⭐ {user.reputation_points || 0}</div>
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
            Available Issues ({availableIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('my-issues')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'my-issues'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Issues ({myIssues.length})
          </button>
        </div>
      </div>

      {/* Available Issues Tab */}
      {activeTab === 'available' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Issues Waiting for Volunteers</h2>
          {availableIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showActions
                  onAction={
                    <button
                      onClick={() => handlePickIssue(issue.id)}
                      className="btn btn-success w-full"
                    >
                      🙋 Pick This Issue
                    </button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No available issues at the moment</p>
            </div>
          )}
        </div>
      )}

      {/* My Issues Tab */}
      {activeTab === 'my-issues' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Issues I'm Working On</h2>
          {myIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">You haven't picked any issues yet</p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn btn-primary mt-4"
              >
                Browse Available Issues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
