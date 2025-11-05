import Link from 'next/link';

const statusColors = {
  Reported: 'badge-info',
  Assigned: 'badge-warning',
  'In Progress': 'badge-warning',
  Resolved: 'badge-success',
  Closed: 'badge-default',
};

const categoryIcons = {
  Infrastructure: '🏗️',
  Cleanliness: '🧹',
  Safety: '⚠️',
  Other: '📋',
};

export default function IssueCard({ issue, showActions = false, onAction }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{categoryIcons[issue.category]}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
            <p className="text-sm text-gray-500">Category: {issue.category}</p>
          </div>
        </div>
        <span className={`badge ${statusColors[issue.status]}`}>
          {issue.status}
        </span>
      </div>

      {issue.image_url && (
        <img
          src={`${API_URL}${issue.image_url}`}
          alt={issue.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}

      <p className="text-gray-600 mb-3 line-clamp-2">
        {issue.enhanced_description || issue.description}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
        <div>
          <span className="font-medium">Priority:</span> {issue.priority}
        </div>
        {issue.ai_categorized && (
          <span className="badge badge-info text-xs">AI Categorized</span>
        )}
      </div>

      {issue.sponsor_amount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
          <span className="text-green-700 font-medium">
            💰 Sponsored: ${issue.sponsor_amount}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {issue.reporter_name && <div>Reported by: {issue.reporter_name}</div>}
          {issue.volunteer_name && <div>Volunteer: {issue.volunteer_name}</div>}
        </div>

        <Link href={`/issues/${issue.id}`} className="btn btn-primary text-sm">
          View Details
        </Link>
      </div>

      {showActions && onAction && (
        <div className="mt-3 pt-3 border-t">
          {onAction}
        </div>
      )}
    </div>
  );
}
