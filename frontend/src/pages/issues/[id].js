import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { issuesAPI } from '../../services/api';

const statusColors = {
  Reported: 'badge-info',
  Assigned: 'badge-warning',
  'In Progress': 'badge-warning',
  Resolved: 'badge-success',
  Closed: 'badge-default',
};

export default function IssueDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [afterImage, setAfterImage] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      const response = await issuesAPI.getById(id);
      setIssue(response.data.issue);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      await issuesAPI.updateStatus(id, newStatus);
      alert('Status updated successfully!');
      fetchIssue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAfterImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      await issuesAPI.uploadAfterImage(id, formData);
      alert('After image uploaded successfully!');
      fetchIssue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading issue...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Issue not found</div>
      </div>
    );
  }

  const canUpdateStatus =
    user && (user.id === issue.assigned_to || user.role === 'admin');

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-primary-600 hover:underline mb-4">
          ← Back
        </button>

        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold">{issue.title}</h1>
          <span className={`badge ${statusColors[issue.status]} text-lg`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issue.image_url && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Before</div>
                  <img
                    src={`${API_URL}${issue.image_url}`}
                    alt="Before"
                    className="w-full h-64 object-cover rounded"
                  />
                </div>
              )}
              {issue.after_image_url ? (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">After</div>
                  <img
                    src={`${API_URL}${issue.after_image_url}`}
                    alt="After"
                    className="w-full h-64 object-cover rounded"
                  />
                </div>
              ) : (
                canUpdateStatus && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">After</div>
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-500">Upload After Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAfterImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {issue.enhanced_description || issue.description}
            </p>
            {issue.ai_categorized && issue.ai_reasoning && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  🤖 AI Analysis
                </div>
                <p className="text-sm text-blue-800">{issue.ai_reasoning}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-grow">
                    <p className="text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{issue.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className="ml-2 font-medium">{issue.priority}</span>
              </div>
              <div>
                <span className="text-gray-600">Reported by:</span>
                <span className="ml-2 font-medium">{issue.reporter_name}</span>
              </div>
              {issue.volunteer_name && (
                <div>
                  <span className="text-gray-600">Volunteer:</span>
                  <span className="ml-2 font-medium">{issue.volunteer_name}</span>
                </div>
              )}
              {issue.sponsor_name && (
                <div>
                  <span className="text-gray-600">Sponsored by:</span>
                  <span className="ml-2 font-medium">{issue.sponsor_name}</span>
                </div>
              )}
              {issue.sponsor_amount > 0 && (
                <div>
                  <span className="text-gray-600">Sponsor Amount:</span>
                  <span className="ml-2 font-medium text-green-600">
                    ${parseFloat(issue.sponsor_amount).toFixed(2)}
                  </span>
                </div>
              )}
              {issue.location_address && (
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2">{issue.location_address}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Reported:</span>
                <span className="ml-2">{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          {canUpdateStatus && (
            <div className="card">
              <h3 className="font-bold text-lg mb-4">Update Status</h3>
              <div className="space-y-2">
                {issue.status !== 'In Progress' && (
                  <button
                    onClick={() => handleStatusUpdate('In Progress')}
                    disabled={updating}
                    className="btn btn-primary w-full text-sm"
                  >
                    Mark as In Progress
                  </button>
                )}
                {issue.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusUpdate('Resolved')}
                    disabled={updating}
                    className="btn btn-success w-full text-sm"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Map (if coordinates available) */}
          {issue.location_lat && issue.location_lng && (
            <div className="card">
              <h3 className="font-bold text-lg mb-4">Location</h3>
              <div className="bg-gray-200 rounded h-48 flex items-center justify-center">
                <p className="text-gray-500">
                  📍 {issue.location_lat.toFixed(4)}, {issue.location_lng.toFixed(4)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
