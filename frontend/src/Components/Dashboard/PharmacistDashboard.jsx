import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({
    totalMedications: 246,
    pendingPrescriptions: 14,
    dispensedToday: 32,
    lowStockItems: 8
  });
  
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setLowStockItems([
        { id: 1, name: 'Amoxicillin 500mg', currentStock: 15, minRequired: 30, category: 'Antibiotics' },
        { id: 2, name: 'Lisinopril 10mg', currentStock: 8, minRequired: 20, category: 'Hypertension' },
        { id: 3, name: 'Insulin Regular', currentStock: 12, minRequired: 25, category: 'Diabetes' },
        { id: 4, name: 'Albuterol Inhaler', currentStock: 5, minRequired: 15, category: 'Respiratory' },
      ]);
      
      setRecentPrescriptions([
        { id: 101, patientName: 'David Anderson', medication: 'Metformin 500mg', dosage: '1 tablet twice daily', status: 'pending' },
        { id: 102, patientName: 'Jennifer Taylor', medication: 'Atorvastatin 20mg', dosage: '1 tablet daily', status: 'dispensed' },
        { id: 103, patientName: 'Thomas Wilson', medication: 'Levothyroxine 75mcg', dosage: '1 tablet daily', status: 'pending' },
        { id: 104, patientName: 'Maria Rodriguez', medication: 'Sertraline 50mg', dosage: '1 tablet daily', status: 'dispensed' },
      ]);
      
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Pharmacy Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Total Medications</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalMedications}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingPrescriptions}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Dispensed Today</p>
                <p className="text-2xl font-bold text-slate-800">{stats.dispensedToday}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-slate-800">{stats.lowStockItems}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Low Stock Medications */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800">Low Stock Medications</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Required</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {lowStockItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.minRequired}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {lowStockItems.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No low stock items
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Prescriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800">Recent Prescriptions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPrescriptions.map(prescription => (
                  <div key={prescription.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div>
                      <div className="flex justify-between">
                        <p className="font-medium text-slate-800">{prescription.patientName}</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-1">{prescription.medication}</p>
                      <p className="text-xs text-slate-500 mt-1">Dosage: {prescription.dosage}</p>
                    </div>
                  </div>
                ))}
              </div>
              {recentPrescriptions.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  No recent prescriptions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
