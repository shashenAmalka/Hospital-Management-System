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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupData, setSuccessPopupData] = useState(null);
  
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

  const confirmDispense = async () => {
    try {
      setDispensing(true);
      
      const quantity = parseInt(dispenseQuantity, 10);
      
      // Validation
      if (!selectedItem || !dispenseQuantity || isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        setTimeout(() => setError(null), 3000);
        setDispensing(false);
        return;
      }

      if (quantity > selectedItem.quantity) {
        setError(`Cannot dispense ${quantity} units. Only ${selectedItem.quantity} units available.`);
        setTimeout(() => setError(null), 3000);
        setDispensing(false);
        return;
      }

      console.log('🔵 Dispensing item:', selectedItem._id, 'Quantity:', quantity);

      // Call API to dispense item
      const response = await pharmacyService.dispensePharmacyItem(selectedItem._id, {
        quantity: quantity,
        reason: dispenseReason.trim() || undefined
      });

      console.log('🟢 Dispense API Response:', response);

      const updatedItem = response?.data?.item;

      if (!updatedItem) {
        console.error('❌ No updated item in response:', response);
        setError('Failed to dispense item. Please try again.');
        setTimeout(() => setError(null), 3000);
        // Close modal even on error
        setShowDispenseModal(false);
        setDispenseQuantity('');
        setDispenseReason('');
        setSelectedItem(null);
        setDispensing(false);
        return;
      }

      console.log('✅ Updated item received:', updatedItem);

      // Update inventory in real-time
      setPharmacyItems(prevItems => 
        prevItems.map(item => 
          item._id === updatedItem._id ? { ...updatedItem, status: normalizeStatus(updatedItem) } : item
        )
      );

      // Update low stock items
      setLowStockItems(prevItems => {
        const isNowLowStock = updatedItem.quantity < updatedItem.minRequired;
        const wasLowStock = prevItems.some(item => item._id === updatedItem._id);
        
        if (isNowLowStock && !wasLowStock) {
          return [...prevItems, { ...updatedItem, status: normalizeStatus(updatedItem) }];
        } else if (isNowLowStock && wasLowStock) {
          return prevItems.map(item => 
            item._id === updatedItem._id ? { ...updatedItem, status: normalizeStatus(updatedItem) } : item
          );
        } else if (!isNowLowStock && wasLowStock) {
          return prevItems.filter(item => item._id !== updatedItem._id);
        }
        return prevItems;
      });

      // Update expiring items if present
      setExpiringItems(prevItems =>
        prevItems.map(item => 
          item._id === updatedItem._id ? { ...updatedItem, status: normalizeStatus(updatedItem) } : item
        )
      );

      // Show success message
      const successMsg = `Successfully dispensed ${quantity} unit${quantity > 1 ? 's' : ''} of ${updatedItem.name}. New quantity: ${updatedItem.quantity}`;
      setSuccess(successMsg);
      setTimeout(() => setSuccess(null), 5000);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      console.log('🎉 Dispense completed successfully. Closing modal...');

      // Close modal and reset form - MOVED TO FINALLY BLOCK TO ENSURE IT ALWAYS RUNS
      
    } catch (error) {
      console.error('❌ Error dispensing item:', error);
      setError(error.message || 'Failed to dispense item. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      // Always close modal and reset form, regardless of success or error
      setShowDispenseModal(false);
      setDispenseQuantity('');
      setDispenseReason('');
      setSelectedItem(null);
      setDispensing(false);
      console.log('🔒 Modal closed and form reset');
    }
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
      
      <div className="max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Pharmacy Dashboard</h1>
        
        {/* Success Message - Enhanced with animation and improved visibility */}
        {success && (
          <div
            ref={successBannerRef}
            className="mb-4 sm:mb-6 bg-green-50 border border-green-500 text-green-800 px-4 sm:px-6 py-4 sm:py-5 rounded-lg shadow-lg flex items-start animate-fadeIn"
            style={{animation: 'fadeIn 0.3s ease-in-out'}}
          >
            <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 mr-3 sm:mr-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-base sm:text-lg text-green-700">{success}</p>
              <p className="text-xs sm:text-sm text-green-700 mt-2">The inventory has been updated in real-time.</p>
            </div>
            <button 
              onClick={() => {
                triggerSuccessBanner(null, 0);
              }}
              className="text-green-600 hover:text-green-800 text-xl sm:text-2xl leading-none ml-3 sm:ml-4"
              title="Close"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-md flex items-start">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-base sm:text-lg">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-xl sm:text-2xl leading-none ml-3 sm:ml-4"
              title="Close"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Total Medications</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalMedications}</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-full">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Pending Prescriptions</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.pendingPrescriptions}</p>
              </div>
              <div className="bg-amber-50 p-2 sm:p-3 rounded-full">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleDispenseSummaryClick}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 text-left w-full hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Dispensed Today</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.dispensedToday}</p>
                <p className="text-xs text-slate-500">Across {stats.dispenseEventsToday} dispense{stats.dispenseEventsToday === 1 ? '' : 's'}</p>
                <p className="text-xs text-green-600 mt-2 hidden sm:block">Click to view detailed report</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-full">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Low Stock Items</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.lowStockItems}</p>
              </div>
              <div className="bg-red-50 p-2 sm:p-3 rounded-full">
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Expiring Soon</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.expiringItems}</p>
              </div>
              <div className="bg-orange-50 p-2 sm:p-3 rounded-full">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">Pharmacy Inventory</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="pl-9 sm:pl-10 pr-4 py-2 w-full text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  Add Item
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Generate</span> Report
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
          
          <div className="p-3 sm:p-6">
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item ID</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Required</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                    {activeTab === 'expiring' && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days Until Expiry</th>
                    )}
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentItems.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.itemId}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.category}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.minRequired}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Rs. {item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      {activeTab === 'expiring' && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
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
                      <td className={`px-4 lg:px-6 py-4 whitespace-nowrap text-sm ${getExpiryDateStyle(item.expiryDate)}`}>
                        {formatDate(item.expiryDate)}
                        {isExpiringWithinMonth(item.expiryDate) && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Expires Soon
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                        <button
                          onClick={() => handleDispenseClick(item)}
                          className={`mr-2 ${
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
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="View Item"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-slate-600 hover:text-slate-900 mr-2"
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
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-4">
              {currentItems.map(item => (
                <div key={item._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 text-base">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">ID: {item.itemId}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Category</p>
                      <p className="text-slate-800 font-medium">{item.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Quantity</p>
                      <p className="text-slate-800 font-medium">{item.quantity} / {item.minRequired}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Unit Price</p>
                      <p className="text-slate-800 font-medium">Rs. {item.unitPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Expiry Date</p>
                      <p className={`font-medium ${getExpiryDateStyle(item.expiryDate)}`}>
                        {formatDate(item.expiryDate)}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'expiring' && item.daysUntilExpiry !== undefined && (
                    <div className="mb-3 p-2 bg-slate-50 rounded text-sm">
                      <p className="text-slate-500 text-xs">Days Until Expiry</p>
                      <div className="flex items-center mt-1">
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
                    </div>
                  )}

                  {isExpiringWithinMonth(item.expiryDate) && (
                    <div className="mb-3">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Expires Soon
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDispenseClick(item)}
                      className={`p-2 rounded-lg ${
                        item.quantity <= 0 
                          ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                      title={item.quantity <= 0 ? 'Out of stock' : 'Dispense Item'}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewItem(item)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      title="View Item"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100"
                      title="Edit Item"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      title="Delete Item"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
              
              {getFilteredItems().length === 0 && (
                <div className="text-center py-8 text-slate-500">
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3 border-t border-slate-200">
              <span className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} results
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {/* First Page Button - Hidden on small screens */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  First
                </button>
                
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                
                {/* Left Ellipsis */}
                {getVisiblePages()[0] > 1 && (
                  <>
                    {getVisiblePages()[0] > 2 && (
                      <span className="px-1 sm:px-2 py-1 text-slate-400 text-xs sm:text-sm">...</span>
                    )}
                  </>
                )}
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getVisiblePages().map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs sm:text-sm font-medium ${
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
                      <span className="px-1 sm:px-2 py-1 text-slate-400 text-xs sm:text-sm">...</span>
                    )}
                  </>
                )}
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                
                {/* Last Page Button - Hidden on small screens */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:inline-block px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">Generate Report</h3>
            <p className="mb-4 sm:mb-6 text-slate-600 text-sm sm:text-base">
              Do you want in which format?
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleGenerateReport('xlsx')}
                className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
              >
                XLSX Format
              </button>
              <button
                onClick={() => handleGenerateReport('pdf')}
                className="px-4 sm:px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base"
              >
                PDF Format
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dispense Summary Modal */}
      {showDispenseSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Today's Dispense Summary</h3>
              <button
                onClick={() => setShowDispenseSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-slate-500">Total Units Dispensed</p>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900">{stats.dispensedToday}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-slate-500">Dispense Events</p>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900">{stats.dispenseEventsToday}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
              {loadingDispenseSummary ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-500 text-sm">Loading summary...</p>
                </div>
              ) : todayDispenses.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {todayDispenses.map((record, index) => {
                    const key = record.id || record._id || `${record.itemId}-${index}`;
                    return (
                      <li key={key} className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
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
                  <p className="text-slate-500 text-sm">No dispenses recorded today.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4 sm:mt-6">
              <button
                onClick={() => setShowDispenseSummaryModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">Delete Item</h3>
            <p className="mb-4 sm:mb-6 text-slate-600 text-sm sm:text-base">
              Are you sure you want to delete <span className="font-medium">{selectedItem.name}</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Item Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Item ID</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">{selectedItem.itemId}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Name</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Category</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Quantity</p>
                <div className="flex items-center">
                  <span className={`px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedItem.status)}`}>
                    {selectedItem.quantity}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Minimum Required</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">{selectedItem.minRequired}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Unit Price</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">Rs. {selectedItem.unitPrice?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Manufacturer</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">{selectedItem.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Supplier</p>
                <p className="text-base sm:text-lg font-medium text-slate-800">
                  {selectedItem.supplier ? (
                    <>
                      {selectedItem.supplier.supplierId} - {selectedItem.supplier.supplierName}
                      <br />
                      <span className="text-xs sm:text-sm text-slate-600">{selectedItem.supplier.contactNumber}</span>
                    </>
                  ) : 'No supplier assigned'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Expiry Date</p>
                <p className={`text-base sm:text-lg font-medium ${isExpiringWithinMonth(selectedItem.expiryDate) ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatDate(selectedItem.expiryDate)}
                  {isExpiringWithinMonth(selectedItem.expiryDate) && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Expires Soon
                    </span>
                  )}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Description</p>
                <p className="text-sm sm:text-base text-slate-800">{selectedItem.description || 'No description provided'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2">
              <button
                onClick={() => handleEditItem(selectedItem)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm"
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

      {/* Dispense Item Modal */}
      {showDispenseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Dispense Item</h3>
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setDispenseQuantity('');
                  setDispenseReason('');
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Item Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">{selectedItem.name}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-600">Item ID:</span>
                  <span className="ml-2 font-medium text-blue-900">{selectedItem.itemId}</span>
                </div>
                <div>
                  <span className="text-blue-600">Category:</span>
                  <span className="ml-2 font-medium text-blue-900">{selectedItem.category}</span>
                </div>
                <div>
                  <span className="text-blue-600">Available:</span>
                  <span className="ml-2 font-bold text-blue-900">{selectedItem.quantity} units</span>
                </div>
                <div>
                  <span className="text-blue-600">Min Required:</span>
                  <span className="ml-2 font-medium text-blue-900">{selectedItem.minRequired}</span>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantity to Dispense <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem.quantity}
                value={dispenseQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && /^\d+$/.test(value))) {
                    setDispenseQuantity(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                placeholder="Enter quantity"
                autoFocus
              />
              {dispenseQuantity && parseInt(dispenseQuantity) > selectedItem.quantity && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Cannot exceed available stock ({selectedItem.quantity} units)
                </p>
              )}
              {dispenseQuantity && parseInt(dispenseQuantity) <= 0 && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Quantity must be greater than 0
                </p>
              )}
              {dispenseQuantity && selectedItem.quantity - parseInt(dispenseQuantity) < selectedItem.minRequired && (
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Warning: Stock will be below minimum required level
                </p>
              )}
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={dispenseReason}
                onChange={(e) => setDispenseReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
                placeholder="Enter reason for dispensing (e.g., Patient prescription, Emergency use, etc.)"
                maxLength={200}
              />
              <p className="text-xs text-slate-500 mt-1">{dispenseReason.length}/200 characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setDispenseQuantity('');
                  setDispenseReason('');
                }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                disabled={dispensing}
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
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {dispensing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Dispensing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm Dispense</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && successPopupData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-40 animate-fadeIn"></div>
          
          {/* Success Popup Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fadeIn transform scale-100 transition-all">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-3">
              Dispensed Successfully!
            </h3>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Item:</span>
                <span className="text-sm font-semibold text-gray-800">{successPopupData.itemName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Item ID:</span>
                <span className="text-sm font-medium text-gray-700">{successPopupData.itemId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantity Dispensed:</span>
                <span className="text-sm font-bold text-green-600">-{successPopupData.dispensedQuantity}</span>
              </div>
              <div className="h-px bg-gray-300 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Previous Quantity:</span>
                <span className="text-sm font-medium text-gray-700">{successPopupData.oldQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Updated Quantity:</span>
                <span className="text-base font-bold text-blue-600">{successPopupData.newQuantity}</span>
              </div>
            </div>

            {/* Success Message */}
            <p className="text-center text-sm text-gray-600 mb-4">
              The inventory has been updated in real-time
            </p>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                setTimeout(() => setSuccessPopupData(null), 300);
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              OK
            </button>

            {/* Auto-close indicator */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Closes automatically in 3 seconds
            </p>
          </div>
        </div>
      )}

      {/* Get Report Floating Button */}
      <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8">
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-blue-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          title="Get Report"
        >
          <Download className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
