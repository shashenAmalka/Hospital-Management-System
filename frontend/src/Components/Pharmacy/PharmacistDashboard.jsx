import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, AlertCircle, CheckCircle, TrendingDown, Plus, Edit, Trash, Eye, Search, Download, Clock, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pharmacyService } from '../../utils/api';

// Add CSS for success notification animation
const successNotificationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

const PharmacistDashboard = ({
  activeTab: propActiveTab,
  onNavigateToAdd,
  onNavigateToEdit,
  onNavigateToInventory
}) => {
  const navigate = useNavigate();
  const successTimeoutRef = useRef(null);
  const successBannerRef = useRef(null);
  const [stats, setStats] = useState({
    totalMedications: 0,
    pendingPrescriptions: 0,
    dispensedToday: 0,
    dispenseEventsToday: 0,
    lowStockItems: 0,
    expiringItems: 0
  });
  
  const [activeTab, setActiveTab] = useState(propActiveTab || 'all-items');
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseQuantity, setDispenseQuantity] = useState('');
  const [dispenseReason, setDispenseReason] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [todayDispenses, setTodayDispenses] = useState([]);
  const [showDispenseSummaryModal, setShowDispenseSummaryModal] = useState(false);
  const [loadingDispenseSummary, setLoadingDispenseSummary] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, activeTab]);

  const loadDispenseSummary = useCallback(async ({ updateStats = true, showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoadingDispenseSummary(true);
      }

      const response = await pharmacyService.getTodayDispenseSummary();
      const summary = response?.data || {};

      setTodayDispenses(Array.isArray(summary.recentDispenses) ? summary.recentDispenses : []);

      if (updateStats) {
        setStats(prev => ({
          ...prev,
          dispensedToday: summary.totalDispensedQuantity || 0,
          dispenseEventsToday: summary.totalDispenseEvents || 0
        }));
      }

      return summary;
    } catch (error) {
      console.error('⚠️ Error fetching dispense summary:', error);

      if (updateStats) {
        setStats(prev => ({
          ...prev,
          dispensedToday: 0,
          dispenseEventsToday: 0
        }));
      }

      return null;
    } finally {
      if (showLoader) {
        setLoadingDispenseSummary(false);
      }
    }
  }, []);
  
  const fetchDashboardData = useCallback(async ({ showLoader = true, withSummary = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      console.log('🔍 Starting to fetch pharmacy dashboard data...');
      
      // Fetch all pharmacy items
      console.log('📞 Calling pharmacyService.getAllPharmacyItems()...');
      const itemsResponse = await pharmacyService.getAllPharmacyItems();
      console.log('📦 Items response:', itemsResponse);
      
      // The API returns {success, count, data} so we access .data directly
      const itemsData = itemsResponse.data || [];
      console.log('📦 Final items data:', itemsData);
      setPharmacyItems(itemsData);
      
      // Fetch low stock items
      console.log('📞 Calling pharmacyService.getLowStockPharmacyItems()...');
      const lowStockResponse = await pharmacyService.getLowStockPharmacyItems();
      console.log('📉 Low stock response:', lowStockResponse);
      const lowStockData = lowStockResponse.data || [];
      setLowStockItems(lowStockData);
      
      // Fetch expiring items
      console.log('📞 Calling pharmacyService.getExpiringPharmacyItems()...');
      const expiringResponse = await pharmacyService.getExpiringPharmacyItems();
      console.log('📅 Expiring items response:', expiringResponse);
      const expiringData = expiringResponse.data || [];
      setExpiringItems(expiringData);
      
      const dispenseSummary = withSummary
        ? await loadDispenseSummary({ updateStats: false, showLoader: false })
        : null;

      // Update stats
      setStats(prev => ({
        totalMedications: Array.isArray(itemsData) ? itemsData.length : 0,
        pendingPrescriptions: prev.pendingPrescriptions || 0,
        dispensedToday: dispenseSummary?.totalDispensedQuantity ?? prev.dispensedToday,
        dispenseEventsToday: dispenseSummary?.totalDispenseEvents ?? prev.dispenseEventsToday,
        lowStockItems: Array.isArray(lowStockData) ? lowStockData.length : prev.lowStockItems,
        expiringItems: Array.isArray(expiringData) ? expiringData.length : prev.expiringItems
      }));
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [loadDispenseSummary]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const handleAddItem = () => {
    if (onNavigateToAdd) {
      onNavigateToAdd();
    } else {
      navigate('/pharmacist/items/add');
    }
  };
  
  const handleEditItem = (item) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(item);
    } else {
      navigate(`/pharmacist/items/edit/${item._id}`);
    }
  };
  
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };
  
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDispenseSummaryClick = () => {
    setShowDispenseSummaryModal(true);
    loadDispenseSummary({ updateStats: true, showLoader: true });
  };
  
  const confirmDelete = async () => {
    try {
      await pharmacyService.deletePharmacyItem(selectedItem._id);
      setPharmacyItems(pharmacyItems.filter(item => item._id !== selectedItem._id));
      
      let statsUpdate = {};
      
      // Also remove from low stock items if present
      if (lowStockItems.some(item => item._id === selectedItem._id)) {
        setLowStockItems(lowStockItems.filter(item => item._id !== selectedItem._id));
        statsUpdate.lowStockItems = stats.lowStockItems - 1;
      }
      
      // Also remove from expiring items if present
      if (expiringItems.some(item => item._id === selectedItem._id)) {
        setExpiringItems(expiringItems.filter(item => item._id !== selectedItem._id));
        statsUpdate.expiringItems = stats.expiringItems - 1;
      }
      
      // Update stats if needed
      if (Object.keys(statsUpdate).length > 0) {
        setStats(prev => ({
          ...prev,
          ...statsUpdate
        }));
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const handleDispenseClick = (item) => {
    setSelectedItem(item);
    setDispenseQuantity('');
    setDispenseReason('');
    setShowDispenseModal(true);
  };

  const normalizeStatus = (item) => {
    if (!item) {
      return 'in stock';
    }
    const quantity = Number(item.quantity ?? 0);
    const minRequired = Number(item.minRequired ?? 0);

    if (quantity <= 0) {
      return 'out of stock';
    }
    if (quantity < minRequired) {
      return 'low stock';
    }
    return 'in stock';
  };

  const triggerSuccessBanner = useCallback((message, timeoutMs = 7000) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    if (!message) {
      setSuccess(null);
      return;
    }

    // Set success message with automatic scroll into view
    setSuccess(message);
    
    // Auto-dismiss after timeout (increased for better visibility)
    if (timeoutMs) {
      successTimeoutRef.current = setTimeout(() => {
        // Fade out effect before removing
        const successElement = successBannerRef.current;
        if (successElement) {
          successElement.style.opacity = '0';
          successElement.style.transition = 'opacity 0.5s ease-out';
          
          setTimeout(() => {
            setSuccess(null);
            successTimeoutRef.current = null;
          }, 500);
        } else {
          setSuccess(null);
          successTimeoutRef.current = null;
        }
      }, timeoutMs);
    }
  }, [setSuccess]);

  const confirmDispense = async () => {
    try {
      setDispensing(true);
      
      const quantity = parseInt(dispenseQuantity, 10);
      
      if (!selectedItem || !dispenseQuantity || isNaN(quantity) || quantity <= 0 || quantity > selectedItem.quantity) {
        setError('Please enter a valid dispense quantity');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const response = await pharmacyService.dispensePharmacyItem(selectedItem._id, {
        quantity: quantity,
        reason: dispenseReason
      });

      const updatedItem = response?.data?.item;

      if (!updatedItem) {
        setError('Failed to dispense item');
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Normalize the updated item for consistent data structure
    const normalizedUpdatedItem = {
        ...updatedItem,
        quantity: Number(updatedItem.quantity ?? 0),
        minRequired: Number(updatedItem.minRequired ?? 0),
        status: normalizeStatus(updatedItem)
      };

      // Real-time inventory update - immediately refresh the displayed inventory
      console.log('🔄 Real-time inventory update for item:', normalizedUpdatedItem.itemId || normalizedUpdatedItem._id);
      
      // Update the main inventory list immediately with the updated item data
      setPharmacyItems(prev => 
        prev.map(item => 
          item._id === normalizedUpdatedItem._id ? normalizedUpdatedItem : item
        )
      );

      // Intelligently update low stock items based on new status
      const isLowStock = normalizedUpdatedItem.status === 'low stock';
      const isCurrentlyLowStock = lowStockItems.some(item => item._id === normalizedUpdatedItem._id);

      let nextLowStockItems = lowStockItems;

      if (isLowStock) {
        nextLowStockItems = isCurrentlyLowStock
          ? lowStockItems.map(item => item._id === normalizedUpdatedItem._id ? normalizedUpdatedItem : item)
          : [...lowStockItems, normalizedUpdatedItem];
      } else {
        nextLowStockItems = lowStockItems.filter(item => item._id !== normalizedUpdatedItem._id);
      }

      setLowStockItems(nextLowStockItems);

      // Update expiring items
      setExpiringItems(prev => 
        prev.map(item => (item._id === normalizedUpdatedItem._id ? normalizedUpdatedItem : item))
      );

      // Update stats using dispense summary from response when available
      const summaryFromResponse = response?.data?.todaySummary;
      if (summaryFromResponse) {
        setTodayDispenses(Array.isArray(summaryFromResponse.recentDispenses) ? summaryFromResponse.recentDispenses : []);
        setStats(prev => ({
          ...prev,
          dispensedToday: summaryFromResponse.totalDispensedQuantity || prev.dispensedToday,
          dispenseEventsToday: summaryFromResponse.totalDispenseEvents || prev.dispenseEventsToday,
          lowStockItems: nextLowStockItems.length
        }));
      } else {
        setStats(prev => ({
          ...prev,
          lowStockItems: nextLowStockItems.length
        }));
      }

      // Reload dispense summary
      if (!summaryFromResponse) {
        await loadDispenseSummary({ updateStats: true, showLoader: false });
      }

      // Update completed - log success for real-time inventory update
      console.log('✅ Real-time inventory synchronized successfully', normalizedUpdatedItem);
      
      // Background sync with latest server data without flashing the full-page loader
      // This ensures we have the latest data while maintaining the immediate UI update
      fetchDashboardData({ showLoader: false, withSummary: false })
        .then(() => console.log('🔄 Background refresh completed'))
        .catch(err => console.error('Background refresh error:', err));

      // Ensure inventory view is focused after dispensing
      setActiveTab('all-items');
      if (typeof onNavigateToInventory === 'function') {
        onNavigateToInventory();
      }

      // Close modal first
      setShowDispenseModal(false);
      setDispenseQuantity('');
      setDispenseReason('');

      // Show success message with enhanced green color text
      const dispensedItemName = selectedItem?.name || normalizedUpdatedItem?.name || 'item';
      const baseSuccess = response?.message || 'Item dispensed successfully';
      const successMsg = `${baseSuccess}: ${quantity} unit${quantity > 1 ? 's' : ''} of ${dispensedItemName}`;
      triggerSuccessBanner(successMsg);
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Error dispensing item:', error);
      setError(error.response?.data?.message || 'Failed to dispense item');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDispensing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (success && successBannerRef.current) {
      successBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [success]);
  
  const getFilteredItems = () => {
    let items = [];
    
    if (activeTab === 'all-items') {
      items = pharmacyItems;
    } else if (activeTab === 'low-stock') {
      items = lowStockItems;
    } else if (activeTab === 'expiring') {
      items = expiringItems;
    }
    
    let filteredItems = items;
    
    if (categoryFilter !== 'All') {
      filteredItems = items.filter(item => item.category === categoryFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.itemId && item.itemId.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(term))
      );
    }
    
    return filteredItems;
  };
  
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'out of stock': return 'bg-red-100 text-red-800';
      case 'low stock': return 'bg-yellow-100 text-yellow-800';
      case 'in stock':
      default: return 'bg-green-100 text-green-800';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringWithinMonth = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    
    return expiry <= oneMonthFromNow && expiry >= today;
  };

  const getExpiryDateStyle = (expiryDate) => {
    if (isExpiringWithinMonth(expiryDate)) {
      return 'text-red-600 font-semibold';
    }
    return 'text-slate-600';
  };

  const filteredItems = getFilteredItems();
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleGenerateReport = async (format) => {
    try {
      setLoading(true);
      setError(null);
      triggerSuccessBanner(null, 0);
      console.log(`🔧 Generating ${format} report...`);
      
      const response = await pharmacyService.generatePharmacyReport(format);
      
      // The response from the pharmacy service is already the raw response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = format === 'xlsx' 
        ? 'pharmacy_inventory_report.xlsx' 
        : 'pharmacy_inventory_report.pdf';
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      setShowReportModal(false);
      triggerSuccessBanner(`${format.toUpperCase()} report generated successfully!`);
      
    } catch (error) {
      console.error(`❌ Error generating ${format} report:`, error);
      triggerSuccessBanner(null, 0);
      setError(`Failed to generate ${format} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Inject CSS for animations */}
      <style>{successNotificationStyles}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Pharmacy Dashboard</h1>
        
        {/* Success Message - Enhanced with animation and improved visibility */}
        {success && (
          <div
            ref={successBannerRef}
            className="mb-6 bg-green-50 border border-green-500 text-green-800 px-6 py-5 rounded-lg shadow-lg flex items-start animate-fadeIn"
            style={{animation: 'fadeIn 0.3s ease-in-out'}}
          >
            <CheckCircle className="h-7 w-7 text-green-600 mr-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-lg text-green-700">{success}</p>
              <p className="text-sm text-green-700 mt-2">The inventory has been updated in real-time.</p>
            </div>
            <button 
              onClick={() => {
                triggerSuccessBanner(null, 0);
              }}
              className="text-green-600 hover:text-green-800 text-2xl leading-none ml-4"
              title="Close"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-md flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-lg">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-2xl leading-none ml-4"
              title="Close"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          
          <button
            type="button"
            onClick={handleDispenseSummaryClick}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left w-full hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Dispensed Today</p>
                <p className="text-2xl font-bold text-slate-800">{stats.dispensedToday}</p>
                <p className="text-xs text-slate-500">Across {stats.dispenseEventsToday} dispense{stats.dispenseEventsToday === 1 ? '' : 's'}</p>
                <p className="text-xs text-green-600 mt-2">Click to view detailed report</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </button>
          
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
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold text-slate-800">{stats.expiringItems}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-slate-800">Pharmacy Inventory</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none w-full md:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Supply">Supply</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Lab Supplies">Lab Supplies</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 20 20">
                      <path d="M5.516 7.548c.436-.446 1.143-.446 1.579 0L10 10.42l2.905-2.872c.436-.446 1.143-.446 1.579 0 .436.445.436 1.167 0 1.612l-3.694 3.65c-.436.446-1.143.446-1.579 0L5.516 9.16c-.436-.445-.436-1.167 0-1.612z" />
                    </svg>
                  </div>
                </div>
                
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-b border-slate-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('all-items')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'all-items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>All Items</span>
              </button>
              
              <button
                onClick={() => setActiveTab('low-stock')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'low-stock'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Low Stock</span>
              </button>
              
              <button
                onClick={() => setActiveTab('expiring')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'expiring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Expiring</span>
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                    {activeTab === 'expiring' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days Until Expiry</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentItems.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.itemId}
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
                        {item.minRequired}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Rs. {item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      {activeTab === 'expiring' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className={`font-medium ${
                              item.daysUntilExpiry <= 7 ? 'text-red-600' : 
                              item.daysUntilExpiry <= 14 ? 'text-orange-600' : 
                              'text-yellow-600'
                            }`}>
                              {item.daysUntilExpiry} days
                            </span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              item.expiryStatus === 'expires very soon' ? 'bg-red-100 text-red-800' :
                              item.expiryStatus === 'expires soon' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.expiryStatus}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getExpiryDateStyle(item.expiryDate)}`}>
                        {formatDate(item.expiryDate)}
                        {isExpiringWithinMonth(item.expiryDate) && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Expires Soon
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                        <button
                          onClick={() => handleDispenseClick(item)}
                          className={`mr-3 ${
                            item.quantity <= 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={item.quantity <= 0 ? 'Out of stock' : 'Dispense Item'}
                          disabled={item.quantity <= 0}
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewItem(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Item"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-slate-600 hover:text-slate-900 mr-3"
                          title="Edit Item"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Item"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {getFilteredItems().length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  {searchTerm 
                    ? 'No items found matching your search' 
                    : activeTab === 'low-stock' 
                      ? 'No low stock items found' 
                      : activeTab === 'expiring'
                        ? 'No expiring items found'
                        : 'No items found'}
                </div>
              )}
            </div>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4">
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
      
      {/* Report Format Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Generate Report</h3>
            <p className="mb-6 text-slate-600">
              Do you want in which format?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleGenerateReport('xlsx')}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                XLSX Format
              </button>
              <button
                onClick={() => handleGenerateReport('pdf')}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                PDF Format
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dispense Summary Modal */}
      {showDispenseSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Today's Dispense Summary</h3>
              <button
                onClick={() => setShowDispenseSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500">Total Units Dispensed</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.dispensedToday}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500">Dispense Events</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.dispenseEventsToday}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
              {loadingDispenseSummary ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-500">Loading summary...</p>
                </div>
              ) : todayDispenses.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {todayDispenses.map((record, index) => {
                    const key = record.id || record._id || `${record.itemId}-${index}`;
                    return (
                      <li key={key} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {record.itemName || 'Unknown item'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {record.category ? `${record.category} • ` : ''}{formatDateTime(record.dispensedAt)}
                          </p>
                          {record.reason && (
                            <p className="text-xs text-slate-500 mt-1">
                              Reason: {record.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900">×{record.quantity}</p>
                          {typeof record.unitPrice === 'number' && (
                            <p className="text-xs text-slate-500">Rs. {(record.unitPrice * record.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-500">No dispenses recorded today.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDispenseSummaryModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Delete Item</h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete <span className="font-medium">{selectedItem.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Item Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Item ID</p>
                <p className="text-lg font-medium text-slate-800">{selectedItem.itemId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Name</p>
                <p className="text-lg font-medium text-slate-800">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Category</p>
                <p className="text-lg font-medium text-slate-800">{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Quantity</p>
                <div className="flex items-center">
                  <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedItem.status)}`}>
                    {selectedItem.quantity}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Minimum Required</p>
                <p className="text-lg font-medium text-slate-800">{selectedItem.minRequired}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unit Price</p>
                <p className="text-lg font-medium text-slate-800">Rs. {selectedItem.unitPrice?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Manufacturer</p>
                <p className="text-lg font-medium text-slate-800">{selectedItem.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Supplier</p>
                <p className="text-lg font-medium text-slate-800">
                  {selectedItem.supplier ? (
                    <>
                      {selectedItem.supplier.supplierId} - {selectedItem.supplier.supplierName}
                      <br />
                      <span className="text-sm text-slate-600">{selectedItem.supplier.contactNumber}</span>
                    </>
                  ) : 'No supplier assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Expiry Date</p>
                <p className={`text-lg font-medium ${isExpiringWithinMonth(selectedItem.expiryDate) ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatDate(selectedItem.expiryDate)}
                  {isExpiringWithinMonth(selectedItem.expiryDate) && (
                    <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Expires Soon
                    </span>
                  )}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-500">Description</p>
                <p className="text-slate-800">{selectedItem.description || 'No description provided'}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleEditItem(selectedItem)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Generate Report</h3>
            <p className="mb-6 text-slate-600">
              Do you want in which format?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleGenerateReport('xlsx')}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                XLSX Format
              </button>
              <button
                onClick={() => handleGenerateReport('pdf')}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                PDF Format
              </button>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowReportModal(false)}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Dispense Item</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-600 mb-2">Item: {selectedItem.name}</p>
              <p className="text-sm text-slate-500 mb-2">Available Quantity: {selectedItem.quantity}</p>
              <p className="text-sm text-slate-500">Item ID: {selectedItem.itemId}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity to Dispense *
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem.quantity}
                value={dispenseQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setDispenseQuantity(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
              {dispenseQuantity && parseInt(dispenseQuantity) > selectedItem.quantity && (
                <p className="text-red-600 text-sm mt-1">
                  Quantity cannot exceed available stock ({selectedItem.quantity})
                </p>
              )}
              {dispenseQuantity && parseInt(dispenseQuantity) <= 0 && (
                <p className="text-red-600 text-sm mt-1">
                  Quantity must be greater than 0
                </p>
              )}
              {!dispenseQuantity && (
                <p className="text-slate-500 text-sm mt-1">
                  Please enter a quantity to dispense
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={dispenseReason}
                onChange={(e) => setDispenseReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter reason for dispensing..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setDispenseQuantity('');
                  setDispenseReason('');
                }}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDispense}
                disabled={
                  dispensing ||
                  !dispenseQuantity || 
                  isNaN(parseInt(dispenseQuantity)) || 
                  parseInt(dispenseQuantity) <= 0 || 
                  parseInt(dispenseQuantity) > selectedItem.quantity
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center"
              >
                {dispensing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Dispensing...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Dispense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Get Report Floating Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          title="Get Report"
        >
          <Download className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
