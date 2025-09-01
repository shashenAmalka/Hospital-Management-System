import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const HistoryTab = ({ user }) => {
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchVisitHistory();
  }, [user]);

  const fetchVisitHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients/${user._id}/visits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVisitHistory(data);
      }
    } catch (error) {
      console.error('Error fetching visit history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading visit history...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">Visit History</h3>
      
      <div className="space-y-4">
        {visitHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No visit history found
          </div>
        ) : (
          visitHistory.map((visit) => (
            <div key={visit._id} className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-800">{visit.reason}</h4>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-1">{visit.doctorName} • {visit.department}</p>
                    <p className="text-sm text-slate-500 mb-3">
                      {new Date(visit.date).toLocaleDateString()}
                    </p>
                    {visit.notes && (
                      <p className="text-sm text-slate-700 bg-white p-3 rounded border">
                        <strong>Notes:</strong> {visit.notes}
                      </p>
                    )}
                    {visit.diagnosis && (
                      <p className="text-sm text-slate-700 bg-white p-3 rounded border mt-2">
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </p>
                    )}
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryTab;