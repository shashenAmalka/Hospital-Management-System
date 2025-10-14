import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash, Eye, Search, Phone, Mail, CheckCircle, XCircle, Package, RefreshCw } from 'lucide-react';
import { supplierService, pharmacyService } from '../../utils/api';

const SupplierDashboard = ({ activeTab: propActiveTab }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'list');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierItems, setSupplierItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    contactNumber: '',
    email: '',
    address: '',
    notes: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
    fetchSuppliers();
    if (propActiveTab === 'items') {
      fetchSupplierItems();
    }
  }, [propActiveTab]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching suppliers...');
      const response = await supplierService.getSuppliersWithStats();
      console.log('✅ Suppliers fetched:', response);
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierItems = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching supplier items...');
      const response = await pharmacyService.getAllPharmacyItems();
      console.log('✅ Supplier items fetched:', response);
      // Filter items that have suppliers assigned
      const itemsWithSuppliers = (response.data || []).filter(item => item.supplier);
      setSupplierItems(itemsWithSuppliers);
    } catch (error) {
      console.error('❌ Error fetching supplier items:', error);
      setError('Failed to fetch supplier items');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRelationships = async () => {
    try {
      setLoading(true);
      console.log('🔄 Syncing supplier-item relationships...');
      const response = await supplierService.syncSupplierItemRelationships();
      console.log('✅ Relationships synced:', response);
      setSuccess(`Relationships synced successfully! ${response.data?.totalItemsWithSuppliers || 0} items connected.`);
      
      // Refresh data
      await fetchSuppliers();
      if (activeTab === 'items') {
        await fetchSupplierItems();
      }
    } catch (error) {
      console.error('❌ Error syncing relationships:', error);
      setError('Failed to sync supplier-item relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('🔧 Creating supplier:', formData);
      await supplierService.createSupplier(formData);
      setSuccess('Supplier created successfully!');
      setShowAddModal(false);
      setFormData({
        supplierName: '',
        contactNumber: '',
        email: '',
        address: '',
        notes: ''
      });
      fetchSuppliers();
    } catch (error) {
      console.error('❌ Error creating supplier:', error);
      setError(error.message || 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      setLoading(true);
      await supplierService.deleteSupplier(selectedSupplier._id);
      setSuccess('Supplier deleted successfully!');
      setShowDeleteModal(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (error) {
      console.error('❌ Error deleting supplier:', error);
      setError(error.message || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactNumber.includes(searchTerm)
  );

  // Pagination
  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Calculate visible page numbers (show only 5 pages at a time)
  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Supplier Management</h1>
        
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
            <button 
              onClick={() => setSuccess(null)}
              className="float-right text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Truck className="h-4 w-4 inline mr-2" />
                Supplier Directory
              </button>
              <button
                onClick={() => {
                  setActiveTab('items');
                  fetchSupplierItems();
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Supplier Items
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-slate-800">Supplier Directory</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentItems.map(supplier => (
                    <tr key={supplier._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {supplier.supplierId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {supplier.supplierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {supplier.contactNumber}
                        </div>
                        {supplier.email && (
                          <div className="flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {supplier.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {supplier.itemCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Rs. {(supplier.totalValue || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supplier.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {supplier.status === 'active' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Supplier"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Supplier"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {currentItems.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {searchTerm ? 'No suppliers found matching your search' : 'No suppliers found'}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-slate-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} results
                </span>
                <div className="flex items-center gap-1">
                  {/* First Page Button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First Page"
                  >
                    First
                  </button>
                  
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Left Ellipsis */}
                  {getVisiblePages()[0] > 1 && (
                    <>
                      {getVisiblePages()[0] > 2 && (
                        <span className="px-2 py-1 text-slate-400">...</span>
                      )}
                    </>
                  )}
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getVisiblePages().map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 border border-slate-300 rounded-md text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  
                  {/* Right Ellipsis */}
                  {getVisiblePages()[getVisiblePages().length - 1] < totalPages && (
                    <>
                      {getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1 && (
                        <span className="px-2 py-1 text-slate-400">...</span>
                      )}
                    </>
                  )}
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  
                  {/* Last Page Button */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last Page"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Supplier Items View */}
        {activeTab === 'items' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-slate-800">Supplier-Item Relationships</h3>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Organized by Primary Keys
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Supplier ID, Item ID, or names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Sync Button */}
                <button
                  onClick={handleSyncRelationships}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync Relationships
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Supplier ID</span>
                        <span className="text-blue-500 text-xs">(Primary Key)</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Item ID</span>
                        <span className="text-blue-500 text-xs">(Primary Key)</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {supplierItems
                    .filter(item => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(term) ||
                        item.itemId.toLowerCase().includes(term) ||
                        item.category.toLowerCase().includes(term) ||
                        (item.supplier && (
                          item.supplier.supplierName.toLowerCase().includes(term) ||
                          item.supplier.supplierId.toLowerCase().includes(term)
                        ))
                      );
                    })
                    .sort((a, b) => {
                      // Primary sort by Supplier ID
                      const supplierA = a.supplier?.supplierId || 'ZZZZ';
                      const supplierB = b.supplier?.supplierId || 'ZZZZ';
                      if (supplierA !== supplierB) {
                        return supplierA.localeCompare(supplierB);
                      }
                      // Secondary sort by Item ID
                      return a.itemId.localeCompare(b.itemId);
                    })
                    .map(item => (
                    <tr key={`${item.supplier?.supplierId || 'no-supplier'}-${item.itemId}`} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 bg-blue-50">
                        {item.supplier?.supplierId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 bg-green-50">
                        {item.itemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.supplier?.supplierName || 'No supplier'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Rs. {item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        Rs. {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {supplierItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No items with suppliers found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Supplier</h3>
              <form onSubmit={handleCreateSupplier}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      placeholder="0123456789"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        supplierName: '',
                        contactNumber: '',
                        email: '',
                        address: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Supplier Modal */}
        {showViewModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Supplier Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Supplier ID</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSupplier.supplierId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSupplier.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Contact Number</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSupplier.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSupplier.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Items Count</p>
                  <p className="text-lg font-medium text-slate-800">{selectedSupplier.itemCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Value</p>
                  <p className="text-lg font-medium text-slate-800">Rs. {(selectedSupplier.totalValue || 0).toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="text-slate-800">{selectedSupplier.address || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Notes</p>
                  <p className="text-slate-800">{selectedSupplier.notes || 'No notes'}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Delete Supplier</h3>
              <p className="mb-6 text-slate-600">
                Are you sure you want to delete <span className="font-medium">{selectedSupplier.supplierName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSupplier}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;