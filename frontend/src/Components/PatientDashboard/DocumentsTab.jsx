import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download } from 'lucide-react';

const DocumentsTab = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/patients/${user._id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, documentName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Medical Documents</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">
            No documents found
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <button 
                  onClick={() => handleDownload(doc._id, doc.name)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <h4 className="font-medium text-slate-800 mb-1">{doc.name}</h4>
              <p className="text-sm text-slate-600 mb-2">{doc.type}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                <span>{doc.size}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;