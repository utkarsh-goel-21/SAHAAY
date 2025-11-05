import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/router';
import { issuesAPI, aiAPI } from '../services/api';

export default function ReportIssue() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location_address: '',
    location_lat: '',
    location_lng: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'citizen') {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude,
          });
          setGettingLocation(false);
          setSuccess('Location captured successfully!');
          setTimeout(() => setSuccess(''), 3000);
        },
        (error) => {
          setGettingLocation(false);
          setError('Failed to get location. Please enter manually.');
          setTimeout(() => setError(''), 3000);
        }
      );
    } else {
      setGettingLocation(false);
      setError('Geolocation is not supported by your browser');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getAiSuggestion = async () => {
    if (!formData.description || formData.description.length < 10) {
      setError('Please enter a description first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const [categoryRes, enhanceRes] = await Promise.all([
        aiAPI.categorize({ description: formData.description, title: formData.title }),
        aiAPI.enhance({ description: formData.description, title: formData.title }),
      ]);

      setAiSuggestion({
        category: categoryRes.data.category,
        priority: categoryRes.data.priority,
        reasoning: categoryRes.data.reasoning,
        enhancedDescription: enhanceRes.data.enhanced,
        wasEnhanced: enhanceRes.data.wasEnhanced,
      });
    } catch (error) {
      console.error('AI suggestion failed:', error);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData({
        ...formData,
        category: aiSuggestion.category,
        description: aiSuggestion.wasEnhanced
          ? aiSuggestion.enhancedDescription
          : formData.description,
      });
      setAiSuggestion(null);
      setSuccess('AI suggestions applied!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.category) formDataToSend.append('category', formData.category);
      if (formData.location_address) formDataToSend.append('location_address', formData.location_address);
      if (formData.location_lat) formDataToSend.append('location_lat', formData.location_lat);
      if (formData.location_lng) formDataToSend.append('location_lng', formData.location_lng);
      if (image) formDataToSend.append('image', image);

      const response = await issuesAPI.create(formDataToSend);

      setSuccess('Issue reported successfully!');
      setTimeout(() => {
        router.push(`/issues/${response.data.issue.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Report a Civic Issue</h1>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="Brief title for the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="input"
              placeholder="Describe the problem in detail"
            />
            <button
              type="button"
              onClick={getAiSuggestion}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              🤖 Get AI Suggestions (Category & Enhancement)
            </button>
          </div>

          {aiSuggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-blue-900">AI Suggestions</h3>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="btn btn-primary text-sm"
                >
                  Apply Suggestions
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Category:</strong> {aiSuggestion.category}
                </p>
                <p>
                  <strong>Priority:</strong> {aiSuggestion.priority}
                </p>
                {aiSuggestion.reasoning && (
                  <p>
                    <strong>Reasoning:</strong> {aiSuggestion.reasoning}
                  </p>
                )}
                {aiSuggestion.wasEnhanced && (
                  <div>
                    <strong>Enhanced Description:</strong>
                    <p className="mt-1 text-gray-700">{aiSuggestion.enhancedDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category {!formData.category && '(AI will auto-categorize if not selected)'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              <option value="">Let AI decide</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-full max-h-64 object-cover rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className="btn btn-secondary"
              >
                {gettingLocation ? 'Getting Location...' : '📍 Use My Location'}
              </button>
            </div>
            <input
              type="text"
              name="location_address"
              value={formData.location_address}
              onChange={handleChange}
              className="input"
              placeholder="Or enter address manually"
            />
            {formData.location_lat && formData.location_lng && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Location captured: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}
