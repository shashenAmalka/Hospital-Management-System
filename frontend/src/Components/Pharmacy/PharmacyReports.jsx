import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Calendar, TrendingUp, Package, Download, FileText, Users, Loader2, X, Activity, LineChart, AlertTriangle } from 'lucide-react';
import { pharmacyService, supplierService } from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const PHARMACY_CATEGORIES = ['Medicine', 'Supply', 'Equipment', 'Lab Supplies'];
const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const FIRST_REPORT_YEAR = 2023;
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = TODAY.getMonth();
const defaultQuickReportsState = {
  dailySummary: null,
  trendAnalysis: {
    months: [],
    totalDispensedLastSixMonths: 0,
    averageMonthlyDispensed: 0,
    peakMonth: null
  },
  stockImpact: {
    categories: [],
    criticalItems: [],
    totals: {
      totalCurrentStock: 0,
      totalMinRequired: 0,
      totalItems: 0,
      totalLowStock: 0,
      totalOutOfStock: 0,
      totalDispensedThisMonth: 0
    }
  }
};

const QUICK_REPORT_TITLES = {
  dailySummary: 'Daily Summary',
  trendAnalysis: 'Trend Analysis',
  stockImpact: 'Stock Impact'
};

const generateSupplierDataFromItems = (items = [], suppliers = []) => {
  console.log('🔍 Analyzing items for supplier data:', items);
  console.log('🔍 Available suppliers:', suppliers);

  const categoryMetrics = {};
  const supplierSet = new Set();
  let totalItems = 0;
  let totalQuantity = 0;
  let totalValue = 0;

  items.forEach(item => {
    if (!item?.supplier || !item?.category) {
      return;
    }

    const category = item.category;
    if (!categoryMetrics[category]) {
      categoryMetrics[category] = {
        supplierIds: new Set(),
        itemCount: 0,
        totalQuantity: 0,
        totalValue: 0
      };
    }

    let supplierId;
    if (typeof item.supplier === 'object' && item.supplier?._id) {
      supplierId = item.supplier._id.toString();
    } else if (typeof item.supplier === 'string') {
      supplierId = item.supplier;
    } else {
      supplierId = item.supplier?.toString();
    }

    if (!supplierId) {
      return;
    }

    supplierSet.add(supplierId);
    categoryMetrics[category].supplierIds.add(supplierId);
    categoryMetrics[category].itemCount += 1;

    const quantity = Number(item.quantity) || 0;
    const value = quantity * (Number(item.unitPrice) || 0);

    categoryMetrics[category].totalQuantity += quantity;
    categoryMetrics[category].totalValue += value;

    totalItems += 1;
    totalQuantity += quantity;
    totalValue += value;
  });

  const orderedCategories = [...PHARMACY_CATEGORIES];
  Object.keys(categoryMetrics).forEach(category => {
    if (!orderedCategories.includes(category)) {
      orderedCategories.push(category);
    }
  });

  const categorySuppliers = orderedCategories.map(category => {
    const metrics = categoryMetrics[category] || {
      supplierIds: new Set(),
      itemCount: 0,
      totalQuantity: 0,
      totalValue: 0
    };

    const baseIndex = PHARMACY_CATEGORIES.indexOf(category);

    return {
      category,
      supplierCount: metrics.supplierIds.size,
      itemCount: metrics.itemCount,
      totalQuantity: metrics.totalQuantity,
      totalValue: metrics.totalValue,
      color: baseIndex !== -1 ? CATEGORY_COLORS[baseIndex] : '#9CA3AF'
    };
  }).filter(item => item.supplierCount > 0);

  const totalUniqueSuppliers = supplierSet.size;

  console.log('🔍 Generated supplier data for chart:', categorySuppliers);

  return {
    categorySuppliers,
    totalSuppliers: totalUniqueSuppliers,
    totals: {
      totalCategories: categorySuppliers.length,
      totalUniqueSuppliers,
      totalItems,
      totalQuantity,
      totalValue,
      totalSuppliersInSystem: suppliers.length
    }
  };
};

const PharmacyReports = () => {
  const [reportData, setReportData] = useState({
    monthlyDispenses: [],
    totalDispensed: 0,
    categorySummary: {}
  });
  const [supplierData, setSupplierData] = useState({
    categorySuppliers: [],
    totalSuppliers: 0,
    totals: {
      totalCategories: 0,
      totalUniqueSuppliers: 0,
      totalItems: 0,
      totalQuantity: 0,
      totalValue: 0,
      totalSuppliersInSystem: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [quickReports, setQuickReports] = useState(defaultQuickReportsState);
  const [quickReportsError, setQuickReportsError] = useState(null);
  const [loadingQuickReports, setLoadingQuickReports] = useState(true);
  const [quickReportModal, setQuickReportModal] = useState({ open: false, type: null });
  const firstReportYear = Math.min(FIRST_REPORT_YEAR, CURRENT_YEAR);
  const availableYears = Array.from({ length: CURRENT_YEAR - firstReportYear + 1 }, (_, index) => firstReportYear + index);

  const clampToCurrentIfNeeded = (monthValue, yearValue) => {
    if (yearValue === CURRENT_YEAR && monthValue > CURRENT_MONTH) {
      return CURRENT_MONTH;
    }
    return monthValue;
  };

  const handleMonthChange = (event) => {
    const requestedMonth = parseInt(event.target.value, 10);
    const safeMonth = clampToCurrentIfNeeded(requestedMonth, selectedYear);
    setSelectedMonth(safeMonth);
  };

  const handleYearChange = (event) => {
    const requestedYear = parseInt(event.target.value, 10);
    setSelectedYear(requestedYear);
    if (clampToCurrentIfNeeded(selectedMonth, requestedYear) !== selectedMonth) {
      setSelectedMonth(CURRENT_MONTH);
    }
  };

  const formatNumber = (value, options = {}) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-';
    }
    return Number(value).toLocaleString(undefined, options);
  };

  const formatPercentage = (value, fractionDigits = 1, { withSign = true } = {}) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return withSign ? '0%' : '0%';
    }
    const numeric = Number(value);
    const absolute = Math.abs(numeric).toFixed(fractionDigits);
    if (!withSign) {
      return `${absolute}%`;
    }
    if (numeric > 0) {
      return `+${absolute}%`;
    }
    if (numeric < 0) {
      return `-${absolute}%`;
    }
    return '0%';
  };

  const formatDateTime = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTrendChangeBadge = (change) => {
    if (change === null || change === undefined || Number.isNaN(change)) {
      return { label: 'No previous data', className: 'text-gray-500' };
    }
    if (Math.abs(change) < 0.01) {
      return { label: 'No change', className: 'text-gray-500' };
    }
    if (change > 0) {
      return { label: `▲ ${formatPercentage(change)}`, className: 'text-emerald-600' };
    }
    return { label: `▼ ${formatPercentage(change)}`, className: 'text-red-500' };
  };

  const computeUtilizationMetrics = (category) => {
    if (!category) {
      return { utilization: 0, severity: 'stable' };
    }
    const dispensed = category.dispensedThisMonth || 0;
    const currentStock = category.currentStock || 0;
    const available = currentStock + dispensed;
    const utilization = available === 0 ? 0 : (dispensed / available) * 100;

    let severity = 'stable';
    if ((category.outOfStockCount || 0) > 0 || utilization >= 75) {
      severity = 'critical';
    } else if ((category.lowStockCount || 0) > 0 || utilization >= 50) {
      severity = 'warning';
    }

    return { utilization, severity };
  };

  const getSeverityRank = (severity) => {
    switch (severity) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      default:
        return 1;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-emerald-100 text-emerald-600';
    }
  };

  const severityLabels = {
    critical: 'Critical',
    warning: 'Watch',
    stable: 'Healthy'
  };

  const handleQuickReportOpen = (type) => {
    setQuickReportModal({ open: true, type });
  };

  const closeQuickReportModal = () => {
    setQuickReportModal({ open: false, type: null });
  };

  const fetchPharmacyData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingQuickReports(true);
      setQuickReportsError(null);
      console.log('Fetching pharmacy analytics and supplier distribution for reports...');

      const [itemsResponse, suppliersResponse, analyticsResponse, distributionResponse] = await Promise.all([
        pharmacyService.getAllPharmacyItems(),
        supplierService.getAllSuppliers(),
        pharmacyService.getDispenseAnalytics(selectedMonth, selectedYear),
        supplierService.getSupplierCategoryDistribution()
      ]);

      console.log('Pharmacy items response:', itemsResponse);
      console.log('Suppliers response:', suppliersResponse);
      console.log('Dispense analytics response:', analyticsResponse);
      console.log('Supplier category distribution response:', distributionResponse);

      const items = itemsResponse.data || [];
      const suppliers = suppliersResponse.data || [];
      const analyticsData = analyticsResponse?.data || {};
      const distributionData = distributionResponse?.data || {};
      
      // Fetch quick reports separately to avoid failing the entire page load
      let quickReportsData = defaultQuickReportsState;
      try {
        const quickReportsResponse = await pharmacyService.getQuickReports();
        console.log('Quick reports response:', quickReportsResponse);
        quickReportsData = quickReportsResponse?.data || defaultQuickReportsState;
        setQuickReportsError(null);
      } catch (quickReportsError) {
        console.error('Error fetching quick reports:', quickReportsError);
        setQuickReportsError('Unable to load quick reports at this time.');
        quickReportsData = defaultQuickReportsState;
      } finally {
        setLoadingQuickReports(false);
      }
      
      const monthlyDispenses = (analyticsData.monthlyDispenses || []).map(category => {
        const baseIndex = PHARMACY_CATEGORIES.indexOf(category.category);
        return {
          ...category,
          color: baseIndex !== -1 ? CATEGORY_COLORS[baseIndex] : '#9CA3AF'
        };
      }).filter(category => category.dispensed > 0);

      const totalDispensed = analyticsData.totalDispensed || 0;

      setReportData({
        monthlyDispenses,
        totalDispensed,
        categorySummary: analyticsData.categorySummary || {}
      });

      console.log('Updated dispensing data from analytics:', {
        monthlyDispenses,
        totalDispensed,
        categorySummary: analyticsData.categorySummary || {}
      });

      const apiSupplierDistribution = (distributionData.distribution || []).map(entry => {
        const baseIndex = PHARMACY_CATEGORIES.indexOf(entry.category);
        return {
          category: entry.category,
          supplierCount: entry.uniqueSuppliers || 0,
          itemCount: entry.itemCount || 0,
          totalQuantity: entry.totalQuantity || 0,
          totalValue: entry.totalValue || 0,
          color: baseIndex !== -1 ? CATEGORY_COLORS[baseIndex] : '#9CA3AF'
        };
      });

      const distributionTotals = distributionData.totals || {};
      const totalSuppliersFromApi = distributionTotals.totalUniqueSuppliers;

      if (apiSupplierDistribution.length > 0) {
        setSupplierData({
          categorySuppliers: apiSupplierDistribution,
          totalSuppliers: totalSuppliersFromApi ?? suppliers.length,
          totals: {
            totalCategories: distributionTotals.totalCategories || apiSupplierDistribution.length,
            totalUniqueSuppliers: totalSuppliersFromApi || 0,
            totalItems: distributionTotals.totalItems || 0,
            totalQuantity: distributionTotals.totalQuantity || 0,
            totalValue: distributionTotals.totalValue || 0,
            totalSuppliersInSystem: suppliers.length
          }
        });
        console.log('Loaded supplier distribution from API:', apiSupplierDistribution);
      } else if (items.length > 0) {
        const supplierAnalysis = generateSupplierDataFromItems(items, suppliers);
        setSupplierData(supplierAnalysis);
        console.log('Generated supplier data (fallback from items):', supplierAnalysis);
      } else {
        setSupplierData({
          categorySuppliers: [],
          totalSuppliers: suppliers.length,
          totals: {
            totalCategories: 0,
            totalUniqueSuppliers: 0,
            totalItems: 0,
            totalQuantity: 0,
            totalValue: 0,
            totalSuppliersInSystem: suppliers.length
          }
        });
      }

      setQuickReports({
        dailySummary: quickReportsData.dailySummary || defaultQuickReportsState.dailySummary,
        trendAnalysis: quickReportsData.trendAnalysis || defaultQuickReportsState.trendAnalysis,
        stockImpact: quickReportsData.stockImpact || defaultQuickReportsState.stockImpact
      });
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
      // Fallback to sample data with actual categories if API fails
      const fallbackData = {
        monthlyDispenses: PHARMACY_CATEGORIES.map((category, index) => ({
          category,
          dispensed: Math.floor(Math.random() * 50) + 10,
          color: CATEGORY_COLORS[index],
          itemCount: Math.floor(Math.random() * 20) + 5,
          totalStock: Math.floor(Math.random() * 500) + 100
        })),
        totalDispensed: 0,
        categorySummary: {}
      };
      
      fallbackData.totalDispensed = fallbackData.monthlyDispenses.reduce((sum, item) => sum + item.dispensed, 0);
      fallbackData.categorySummary = fallbackData.monthlyDispenses.reduce((acc, item) => {
        acc[item.category] = item.dispensed;
        return acc;
      }, {});
      
      setReportData(fallbackData);
      
      // Fallback supplier data
      const fallbackSupplierData = {
        categorySuppliers: PHARMACY_CATEGORIES.map((category, index) => ({
          category,
          supplierCount: Math.floor(Math.random() * 5) + 2,
          color: CATEGORY_COLORS[index]
        })),
        totalSuppliers: Math.floor(Math.random() * 15) + 10
      };

      fallbackSupplierData.totals = {
        totalCategories: fallbackSupplierData.categorySuppliers.length,
        totalUniqueSuppliers: fallbackSupplierData.totalSuppliers,
        totalItems: fallbackSupplierData.categorySuppliers.reduce((sum, item) => sum + item.supplierCount * 3, 0),
        totalQuantity: fallbackSupplierData.categorySuppliers.reduce((sum, item) => sum + item.supplierCount * 25, 0),
        totalValue: fallbackSupplierData.categorySuppliers.reduce((sum, item) => sum + item.supplierCount * 2500, 0),
        totalSuppliersInSystem: fallbackSupplierData.totalSuppliers
      };

      setSupplierData(fallbackSupplierData);
      setQuickReports(defaultQuickReportsState);
      setQuickReportsError('Unable to load quick reports at this time.');
      setLoadingQuickReports(false);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPharmacyData();
  }, [fetchPharmacyData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dailySummary = quickReports?.dailySummary;
  const topDailyCategory = dailySummary?.topCategories?.[0];
  const latestTrendMonth = quickReports?.trendAnalysis?.months?.length
    ? quickReports.trendAnalysis.months[quickReports.trendAnalysis.months.length - 1]
    : null;
  const trendChangeBadge = getTrendChangeBadge(latestTrendMonth?.changeFromPrevious ?? null);
  const stockTotals = quickReports?.stockImpact?.totals || defaultQuickReportsState.stockImpact.totals;
  const criticalItemsCount = quickReports?.stockImpact?.criticalItems?.length || 0;
  const stockImpactCategories = quickReports?.stockImpact?.categories || [];
  const highestSeverityCategory = stockImpactCategories.reduce((acc, category) => {
    const metrics = computeUtilizationMetrics(category);
    const rank = getSeverityRank(metrics.severity);
    if (!acc) {
      return { data: category, metrics, rank };
    }
    if (rank > acc.rank || (rank === acc.rank && metrics.utilization > acc.metrics.utilization)) {
      return { data: category, metrics, rank };
    }
    return acc;
  }, null);
  const hasDailyData = Boolean(
    dailySummary && (
      (dailySummary.totalDispensedQuantity || 0) > 0 ||
      (dailySummary.totalDispenseEvents || 0) > 0 ||
      (dailySummary.recentDispenses || []).length > 0
    )
  );
  const hasTrendData = Boolean(quickReports?.trendAnalysis?.months?.some(month => (month.totalDispensed || 0) > 0));
  const isStockEmpty =
    stockImpactCategories.length === 0 &&
    criticalItemsCount === 0 &&
    (stockTotals.totalCurrentStock || 0) === 0 &&
    (stockTotals.totalDispensedThisMonth || 0) === 0;
  const quickReportsAvailable = !loadingQuickReports && !quickReportsError;

  const quickReportCards = [
    {
      type: 'dailySummary',
      title: QUICK_REPORT_TITLES.dailySummary,
      icon: FileText,
      accentClass: 'text-blue-600',
      backgroundClass: 'bg-blue-50',
      description: hasDailyData
        ? "Snapshot of today's dispensing performance."
        : 'No dispensing activity recorded yet today.',
      primaryValue: hasDailyData ? formatNumber(dailySummary?.totalDispensedQuantity || 0) : '—',
      primaryLabel: 'Items dispensed today',
      metrics: [
        {
          label: 'Dispense events',
          value: hasDailyData ? formatNumber(dailySummary?.totalDispenseEvents || 0) : '—'
        },
        {
          label: 'Top category',
          value: topDailyCategory
            ? `${topDailyCategory.category} (${formatNumber(topDailyCategory.quantity)} items)`
            : '—'
        }
      ],
      isEmpty: !hasDailyData
    },
    {
      type: 'trendAnalysis',
      title: QUICK_REPORT_TITLES.trendAnalysis,
      icon: LineChart,
      accentClass: 'text-emerald-600',
      backgroundClass: 'bg-emerald-50',
      description: hasTrendData
        ? 'Six-month dispensing trend overview.'
        : 'Trend data appears once dispensing history accumulates.',
      primaryValue: hasTrendData ? formatNumber(latestTrendMonth?.totalDispensed || 0) : '—',
      primaryLabel: latestTrendMonth ? `Latest month · ${latestTrendMonth.label}` : 'No recent data',
      metrics: [
        {
          label: 'Change vs prev.',
          value: trendChangeBadge.label,
          className: trendChangeBadge.className
        },
        {
          label: 'Monthly average',
          value: hasTrendData
            ? formatNumber(quickReports?.trendAnalysis?.averageMonthlyDispensed || 0)
            : '—'
        }
      ],
      extra: quickReports?.trendAnalysis?.peakMonth
        ? `Peak: ${quickReports.trendAnalysis.peakMonth.label}`
        : null,
      isEmpty: !hasTrendData
    },
    {
      type: 'stockImpact',
      title: QUICK_REPORT_TITLES.stockImpact,
      icon: Activity,
      accentClass: 'text-purple-600',
      backgroundClass: 'bg-purple-50',
      description: isStockEmpty
        ? 'Stock impact metrics will appear once dispensing data is available.'
        : 'Compare dispensing impact across current stock levels.',
      primaryValue: isStockEmpty
        ? '—'
        : formatNumber(stockTotals.totalDispensedThisMonth || 0),
      primaryLabel: 'Items dispensed this month',
      metrics: [
        {
          label: 'Current stock',
          value: formatNumber(stockTotals.totalCurrentStock || 0)
        },
        {
          label: 'Critical items',
          value: criticalItemsCount ? formatNumber(criticalItemsCount) : '0'
        }
      ],
      badge: highestSeverityCategory
        ? {
            text: `${highestSeverityCategory.data.category}: ${formatPercentage(
              highestSeverityCategory.metrics.utilization,
              0,
              { withSign: false }
            )} utilized`,
            severity: highestSeverityCategory.metrics.severity
          }
        : null,
      isEmpty: isStockEmpty
    }
  ];

  const renderQuickReportModal = () => {
    if (!quickReportModal.open || !quickReportModal.type) {
      return null;
    }

    const type = quickReportModal.type;
    const iconMap = {
      dailySummary: FileText,
      trendAnalysis: LineChart,
      stockImpact: Activity
    };
    const accentMap = {
      dailySummary: 'text-blue-600',
      trendAnalysis: 'text-emerald-600',
      stockImpact: 'text-purple-600'
    };

    const IconComponent = iconMap[type] || FileText;
    const accentClass = accentMap[type] || 'text-blue-600';

    let subtitle = '';
    let body = null;

    if (type === 'dailySummary') {
      const topCategories = dailySummary?.topCategories || [];
      const recentDispenses = dailySummary?.recentDispenses || [];

      subtitle = "Today's dispensing activity";
      body = (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-600">Items dispensed</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {formatNumber(dailySummary?.totalDispensedQuantity || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Dispense events</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(dailySummary?.totalDispenseEvents || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-600">Top category</p>
              <p className="mt-2 text-lg font-semibold text-emerald-900">
                {topDailyCategory
                  ? `${topDailyCategory.category} · ${formatNumber(topDailyCategory.quantity)} items`
                  : 'No dispensing yet today'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Top Categories Today</h4>
            {topCategories.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topCategories.map((entry, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-800">{entry.category}</p>
                    <p className="text-xs text-gray-500">{formatNumber(entry.quantity)} items dispensed</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No category-level dispensing recorded yet today.</p>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Recent Dispenses</h4>
            {recentDispenses.length ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Dispensed at</th>
                      <th className="px-4 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentDispenses.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{record.itemName || 'Unknown item'}</td>
                        <td className="px-4 py-3 text-gray-600">{record.category || '—'}</td>
                        <td className="px-4 py-3 text-gray-900">{formatNumber(record.quantity || 0)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(record.dispensedAt)}</td>
                        <td className="px-4 py-3 text-gray-500">{record.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Recent dispensing records will appear here as they occur.</p>
            )}
          </div>
        </div>
      );
    } else if (type === 'trendAnalysis') {
      const months = quickReports?.trendAnalysis?.months || [];
      const peakMonth = quickReports?.trendAnalysis?.peakMonth;

      subtitle = 'Six-month dispensing trend overview';
      body = (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-600">Total (6 months)</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">
                {formatNumber(quickReports?.trendAnalysis?.totalDispensedLastSixMonths || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Average per month</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(quickReports?.trendAnalysis?.averageMonthlyDispensed || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase text-indigo-600">Peak month</p>
              <p className="mt-2 text-lg font-semibold text-indigo-900">
                {peakMonth ? `${peakMonth.label} · ${formatNumber(peakMonth.totalDispensed || 0)} items` : 'Not enough data yet'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Monthly breakdown</h4>
            {months.length ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Items dispensed</th>
                      <th className="px-4 py-3">Change vs prev.</th>
                      <th className="px-4 py-3">Top categories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {months.map((month, index) => {
                      const badge = getTrendChangeBadge(month.changeFromPrevious);
                      return (
                        <tr key={`${month.year}-${month.month}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{month.label}</td>
                          <td className="px-4 py-3 text-gray-900">{formatNumber(month.totalDispensed || 0)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={badge.className}>{badge.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {(month.categoryBreakdown || []).slice(0, 3).map((cat, catIndex) => (
                              <span key={catIndex} className="mr-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                {cat.category}: {formatNumber(cat.quantity)}
                              </span>
                            ))}
                            {!(month.categoryBreakdown || []).length && '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Trend analysis will populate after we capture more historical dispensing data.</p>
            )}
          </div>
        </div>
      );
    } else if (type === 'stockImpact') {
      const categories = stockImpactCategories
        .slice()
        .sort((a, b) => {
          const aMetrics = computeUtilizationMetrics(a);
          const bMetrics = computeUtilizationMetrics(b);
          const rankDifference = getSeverityRank(bMetrics.severity) - getSeverityRank(aMetrics.severity);
          if (rankDifference !== 0) {
            return rankDifference;
          }
          return bMetrics.utilization - aMetrics.utilization;
        });
      const criticalItems = quickReports?.stockImpact?.criticalItems || [];

      subtitle = 'Dispensing impact vs remaining stock';
      body = (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase text-purple-600">Current stock</p>
              <p className="mt-2 text-2xl font-bold text-purple-900">{formatNumber(stockTotals.totalCurrentStock || 0)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Minimum required</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(stockTotals.totalMinRequired || 0)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-600">Dispensed this month</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">{formatNumber(stockTotals.totalDispensedThisMonth || 0)}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase text-rose-600">Low / Out of stock</p>
              <p className="mt-2 text-lg font-semibold text-rose-900">
                {formatNumber((stockTotals.totalLowStock || 0) + (stockTotals.totalOutOfStock || 0))} items
              </p>
              <p className="text-xs text-rose-500">
                {formatNumber(stockTotals.totalLowStock || 0)} low · {formatNumber(stockTotals.totalOutOfStock || 0)} out
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Category utilization</h4>
            {categories.length ? (
              <div className="space-y-3">
                {categories.map((category, index) => {
                  const metrics = computeUtilizationMetrics(category);
                  const severityLabel = severityLabels[metrics.severity] || 'Healthy';
                  return (
                    <div
                      key={`${category.category}-${index}`}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{category.category}</p>
                          <p className="text-xs text-gray-500">
                            Stock: {formatNumber(category.currentStock || 0)} · Dispensed: {formatNumber(category.dispensedThisMonth || 0)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyles(metrics.severity)}`}>
                          {severityLabel}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Utilization</span>
                          <span>{formatPercentage(metrics.utilization, 0, { withSign: false })}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${metrics.severity === 'critical' ? 'bg-red-500' : metrics.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(metrics.utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Category utilization will appear once stock data is available.</p>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Critical items</h4>
            {criticalItems.length ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Min required</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {criticalItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category || '—'}</td>
                        <td className="px-4 py-3 text-gray-900">{formatNumber(item.quantity || 0)}</td>
                        <td className="px-4 py-3 text-gray-900">{formatNumber(item.minRequired || 0)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyles(item.status === 'out of stock' ? 'critical' : item.status === 'low stock' ? 'warning' : 'stable')}`}>
                            {item.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No critical stock issues detected right now.</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full bg-gray-100 p-3 ${accentClass}`}>
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{QUICK_REPORT_TITLES[type] || 'Quick Report'}</h3>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeQuickReportModal}
              className="rounded-full p-2 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close quick report"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
            {body}
          </div>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-500">Loading dispensing data...</div>
            <div className="text-sm text-gray-400 mt-2">Fetching from pharmacy inventory...</div>
          </div>
        </div>
      );
    }

    if (reportData.monthlyDispenses.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">No dispensing data available</div>
            <div className="text-sm text-gray-400">
              No items were dispensed in {monthNames[selectedMonth]} {selectedYear}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Categories: Medicine • Supply • Equipment • Lab Supplies
            </div>
          </div>
        </div>
      );
    }

    const { monthlyDispenses, totalDispensed } = reportData;
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="400" height="400" viewBox="0 0 400 400">
            <g transform="translate(200,200)">
              {monthlyDispenses.map((item, index) => {
                const percentage = (item.dispensed / totalDispensed) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = (cumulativePercentage / 100) * 360 - 90; // Start from top
                const endAngle = startAngle + angle;
                
                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const radius = 150;
                
                const x1 = Math.cos(startAngleRad) * radius;
                const y1 = Math.sin(startAngleRad) * radius;
                const x2 = Math.cos(endAngleRad) * radius;
                const y2 = Math.sin(endAngleRad) * radius;
                
                const pathData = [
                  `M 0 0`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                const result = (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    title={`${item.category}: ${item.dispensed} items (${percentage.toFixed(1)}%)`}
                  />
                );

                cumulativePercentage += percentage;
                return result;
              })}
              
              {/* Center circle for donut effect */}
              <circle cx="0" cy="0" r="60" fill="white" stroke="#e5e7eb" strokeWidth="2" />
              <text x="0" y="-10" textAnchor="middle" className="text-lg font-bold fill-gray-800">
                {totalDispensed}
              </text>
              <text x="0" y="10" textAnchor="middle" className="text-sm fill-gray-600">
                Total Items
              </text>
            </g>
          </svg>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-500">Loading supplier data...</div>
          </div>
        </div>
      );
    }

    if (supplierData.categorySuppliers.length === 0) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">No supplier data available</div>
            <div className="text-sm text-gray-400">
              Supplier information will appear here when items have assigned suppliers
            </div>
          </div>
        </div>
      );
    }

    console.log('🔍 Rendering bar chart with supplier data:', supplierData.categorySuppliers);
    const maxSupplierCount = Math.max(...supplierData.categorySuppliers.map(item => item.supplierCount), 1);
    console.log('🔍 Max supplier count:', maxSupplierCount);
    
    // Ensure minimum height for chart even if all counts are 0
    const effectiveMaxCount = maxSupplierCount > 0 ? maxSupplierCount : 5;
    
    const chartHeight = 250;
    const chartWidth = 400;
    const barWidth = chartWidth / supplierData.categorySuppliers.length * 0.7;
    const barSpacing = chartWidth / supplierData.categorySuppliers.length * 0.3;

    return (
      <div className="flex flex-col items-center">
        <svg width={chartWidth + 100} height={chartHeight + 80} viewBox={`0 0 ${chartWidth + 100} ${chartHeight + 80}`}>
          {/* Y-axis */}
          <line x1="50" y1="30" x2="50" y2={chartHeight + 30} stroke="#e5e7eb" strokeWidth="2" />
          
          {/* X-axis */}
          <line x1="50" y1={chartHeight + 30} x2={chartWidth + 50} y2={chartHeight + 30} stroke="#e5e7eb" strokeWidth="2" />
          
          {/* Y-axis labels */}
          {[0, Math.ceil(effectiveMaxCount / 4), Math.ceil(effectiveMaxCount / 2), Math.ceil(effectiveMaxCount * 3 / 4), effectiveMaxCount].map((value, index) => (
            <g key={index}>
              <text 
                x="45" 
                y={chartHeight + 30 - (value / effectiveMaxCount) * chartHeight + 5} 
                textAnchor="end" 
                className="text-xs fill-gray-600"
              >
                {value}
              </text>
              <line 
                x1="50" 
                y1={chartHeight + 30 - (value / effectiveMaxCount) * chartHeight} 
                x2={chartWidth + 50} 
                y2={chartHeight + 30 - (value / effectiveMaxCount) * chartHeight} 
                stroke="#f3f4f6" 
                strokeWidth="1"
              />
            </g>
          ))}
          
          {/* Bars */}
          {supplierData.categorySuppliers.map((item, index) => {
            const barHeight = (item.supplierCount / effectiveMaxCount) * chartHeight;
            const x = 50 + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = chartHeight + 30 - barHeight;
            
            console.log('🔍 Drawing bar for:', item.category, 'count:', item.supplierCount, 'height:', barHeight);
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)} // Minimum height of 2px
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`${item.category}: ${item.supplierCount} suppliers`}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-bold fill-gray-800"
                >
                  {item.supplierCount}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 45}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
          
          {/* Chart title */}
          <text x={chartWidth / 2 + 50} y="20" textAnchor="middle" className="text-sm font-bold fill-gray-800">
            Suppliers per Category
          </text>
        </svg>
      </div>
    );
  };

  const handleExportReport = async () => {
    try {
      console.log('=== Starting PDF export ===');
      console.log('Report Data:', JSON.stringify(reportData, null, 2));
      console.log('Supplier Data:', JSON.stringify(supplierData, null, 2));
      console.log('Quick Reports:', JSON.stringify(quickReports, null, 2));
      console.log('Loading Quick Reports:', loadingQuickReports);
      console.log('Quick Reports Error:', quickReportsError);
      
      // Validate essential data
      if (!reportData) {
        throw new Error('Report data is not available');
      }

      // Show loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.id = 'pdf-loading';
      loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; text-align: center;';
      loadingMessage.innerHTML = '<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Generating PDF Report...</div><div style="font-size: 14px; color: #666;">Capturing charts and compiling data</div>';
      document.body.appendChild(loadingMessage);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // ========== HEADER ==========
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153);
    doc.setFont('helvetica', 'bold');
    doc.text('HelaMed Hospital Management System', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text('Pharmacy Dispensing Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${monthNames[selectedMonth]} ${selectedYear}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Decorative line
    yPosition += 8;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // ========== SUMMARY STATISTICS ==========
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 8;

    // Summary box
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const summaryY = yPosition + 7;
    doc.text(`Total Items Dispensed:`, 25, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${reportData?.totalDispensed || 0}`, 75, summaryY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Categories:`, 25, summaryY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${reportData?.monthlyDispenses?.length || 0}`, 75, summaryY + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Status:`, 25, summaryY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 0);
    doc.text('Complete', 75, summaryY + 14);
    
    yPosition += 35;

    // ========== CAPTURE AND ADD PIE CHART ==========
    if (reportData && reportData.monthlyDispenses && reportData.monthlyDispenses.length > 0) {
      const pieChartElement = document.getElementById('pharmacy-pie-chart');
      if (pieChartElement) {
        try {
          checkNewPage(120);
          doc.setFontSize(14);
          doc.setTextColor(0, 102, 204);
          doc.setFont('helvetica', 'bold');
          doc.text('Monthly Dispensing by Inventory Category', 20, yPosition);
          yPosition += 8;

          const canvas = await html2canvas(pieChartElement, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Center the image
          const xPosition = (pageWidth - imgWidth) / 2;
          doc.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.error('Error capturing pie chart:', error);
        }
      }
    }

    // ========== DISPENSES BY CATEGORY TABLE ==========
    if (reportData && reportData.monthlyDispenses && reportData.monthlyDispenses.length > 0) {
      checkNewPage(60);
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.setFont('helvetica', 'bold');
      doc.text('Dispenses by Inventory Category - Detailed Breakdown', 20, yPosition);
      yPosition += 5;

      const categoryTableData = reportData.monthlyDispenses.map(item => {
        const percentage = reportData.totalDispensed > 0 
          ? ((item.dispensed / reportData.totalDispensed) * 100).toFixed(1)
          : '0.0';
        return [
          item.category || 'Unknown',
          (item.dispensed || 0).toString(),
          `${percentage}%`,
          item.color || '#9CA3AF'
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Items Dispensed', 'Percentage', 'Status']],
        body: categoryTableData.map(row => [row[0], row[1], row[2], '●']),
        theme: 'striped',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 60 },
          1: { halign: 'center', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 35 },
          3: { halign: 'center', cellWidth: 25 }
        },
        didParseCell: function(data) {
          if (data.column.index === 3 && data.row.index >= 0 && categoryTableData[data.row.index]) {
            const colorHex = categoryTableData[data.row.index][3];
            if (colorHex) {
              data.cell.styles.textColor = colorHex;
              data.cell.styles.fontSize = 16;
            }
          }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    } else {
      // No dispense data available
      checkNewPage(30);
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.setFont('helvetica', 'bold');
      doc.text('Dispenses by Inventory Category', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('No dispensing data available for this period.', 20, yPosition);
      yPosition += 20;
    }

    // ========== QUICK REPORTS SECTION ==========
    if (quickReports && !loadingQuickReports && !quickReportsError) {
      // Daily Summary
      if (quickReports.dailySummary) {
        checkNewPage(50);
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Summary', 20, yPosition);
        yPosition += 8;

        const daily = quickReports.dailySummary;
        const dailyData = [
          ['Metric', 'Value'],
          ['Items Dispensed Today', daily.dispensedToday?.toString() || '0'],
          ['Unique Categories', daily.uniqueCategories?.toString() || '0'],
          ['Total Value', `Rs. ${(daily.totalValue || 0).toFixed(2)}`],
          ['Average per Transaction', `Rs. ${(daily.averageValue || 0).toFixed(2)}`]
        ];

        autoTable(doc, {
          startY: yPosition,
          body: dailyData,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 60, halign: 'right' }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 12;
      }

      // Trend Analysis
      if (quickReports.trendAnalysis && quickReports.trendAnalysis.months && quickReports.trendAnalysis.months.length > 0) {
        checkNewPage(70);
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text('6-Month Trend Analysis', 20, yPosition);
        yPosition += 8;

        const trend = quickReports.trendAnalysis;
        const trendSummary = [
          ['Total Dispensed (6 months)', trend.totalDispensedLastSixMonths?.toString() || '0'],
          ['Monthly Average', Math.round(trend.averageMonthlyDispensed || 0).toString()],
          ['Peak Month', trend.peakMonth || 'N/A']
        ];

        autoTable(doc, {
          startY: yPosition,
          body: trendSummary,
          theme: 'plain',
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 60, halign: 'right' }
          },
          margin: { left: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 8;

        // Monthly breakdown
        if (trend.months && trend.months.length > 0) {
          const monthlyData = trend.months.map(m => [
            m.month || 'Unknown',
            m.totalDispensed?.toString() || '0'
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Month', 'Dispensed']],
            body: monthlyData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 40, halign: 'right' }
            },
            margin: { left: 20, right: 20 }
          });

          yPosition = doc.lastAutoTable.finalY + 12;
        }
      }

      // Stock Impact
      if (quickReports.stockImpact && quickReports.stockImpact.totals) {
        checkNewPage(80);
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text('Stock Impact Analysis', 20, yPosition);
        yPosition += 8;

        const stock = quickReports.stockImpact.totals;
        const stockData = [
          ['Metric', 'Value'],
          ['Total Current Stock', stock.totalCurrentStock?.toString() || '0'],
          ['Total Items', stock.totalItems?.toString() || '0'],
          ['Low Stock Items', stock.totalLowStock?.toString() || '0'],
          ['Out of Stock Items', stock.totalOutOfStock?.toString() || '0'],
          ['Dispensed This Month', stock.totalDispensedThisMonth?.toString() || '0']
        ];

        autoTable(doc, {
          startY: yPosition,
          body: stockData,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 60, halign: 'right' }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 12;

        // Critical Items
        if (quickReports.stockImpact.criticalItems && quickReports.stockImpact.criticalItems.length > 0) {
          checkNewPage(60);
          doc.setFontSize(12);
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text('⚠ Critical Stock Items', 20, yPosition);
          yPosition += 6;

          const criticalData = quickReports.stockImpact.criticalItems.slice(0, 10).map(item => [
            item.name || 'Unknown',
            item.category || 'N/A',
            item.currentStock?.toString() || '0',
            item.minRequired?.toString() || '0',
            item.status || 'Low'
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Item Name', 'Category', 'Current', 'Min Required', 'Status']],
            body: criticalData,
            theme: 'striped',
            headStyles: {
              fillColor: [220, 38, 38],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [254, 242, 242] },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 35 },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 30, halign: 'center' },
              4: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: 20, right: 20 }
          });

          yPosition = doc.lastAutoTable.finalY + 12;
        }
      }
    }

    // ========== SUPPLIER DISTRIBUTION ==========
    if (supplierData && supplierData.categorySuppliers && supplierData.categorySuppliers.length > 0) {
      // Capture bar chart
      const barChartElement = document.getElementById('pharmacy-bar-chart');
      if (barChartElement) {
        try {
          checkNewPage(120);
          doc.setFontSize(14);
          doc.setTextColor(0, 102, 204);
          doc.setFont('helvetica', 'bold');
          doc.text('Supplier Distribution by Category', 20, yPosition);
          yPosition += 8;

          const canvas = await html2canvas(barChartElement, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Center the image
          const xPosition = (pageWidth - imgWidth) / 2;
          doc.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.error('Error capturing bar chart:', error);
        }
      }

      // Add supplier table
      checkNewPage(60);
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.setFont('helvetica', 'bold');
      doc.text('Supplier Distribution - Detailed Data', 20, yPosition);
      yPosition += 8;

      const supplierTableData = supplierData.categorySuppliers.map(dist => [
        dist.category || 'Unknown',
        dist.supplierCount?.toString() || '0',
        dist.itemCount?.toString() || '0',
        `Rs. ${(dist.totalValue || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Suppliers', 'Items', 'Total Value']],
        body: supplierTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 50, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // ========== FOOTER ==========
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('HelaMed Hospital Management System - Pharmacy Department', 20, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Save the PDF
    const fileName = `Pharmacy_Report_${monthNames[selectedMonth]}_${selectedYear}.pdf`;
    doc.save(fileName);
    console.log('PDF exported successfully:', fileName);

    // Remove loading message
    const loadingElement = document.getElementById('pdf-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    
    // Remove loading message
    const loadingElement = document.getElementById('pdf-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    alert(`Failed to export PDF: ${error.message}\n\nPlease check the browser console for more details.`);
  }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pharmacy Reports</h1>
            <p className="text-gray-600">Monthly dispensing analytics by inventory category</p>
            <p className="text-sm text-gray-500 mt-1">
              Categories: Medicine • Supply • Equipment • Lab Supplies
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((month, index) => (
                <option
                  key={month}
                  value={index}
                  disabled={selectedYear === CURRENT_YEAR && index > CURRENT_MONTH}
                >
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div id="pharmacy-pie-chart" className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Monthly Dispensing by Inventory Category</h2>
              <p className="text-sm text-gray-600 mt-1">
                Based on actual pharmacy items and estimated monthly usage
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>{monthNames[selectedMonth]} {selectedYear}</span>
            </div>
          </div>
          {renderPieChart()}
        </div>

        {/* Legend and Summary */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Categories</h3>
            <div className="space-y-3">
              {reportData.monthlyDispenses.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      {item.itemCount !== undefined && (
                        <div className="text-xs text-gray-500">
                          {item.itemCount} items in inventory
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{item.dispensed}</div>
                    <div className="text-xs text-gray-500">
                      {((item.dispensed / reportData.totalDispensed) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Dispensed</span>
                </div>
                <span className="text-xl font-bold text-gray-800">{reportData.totalDispensed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Categories</span>
                </div>
                <span className="text-xl font-bold text-gray-800">{reportData.monthlyDispenses.length}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Most Dispensed:</span>
                  <br />
                  {reportData.monthlyDispenses.length > 0 && 
                    reportData.monthlyDispenses.reduce((max, item) => 
                      item.dispensed > max.dispensed ? item : max
                    ).category
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Analysis Bar Chart */}
      <div id="pharmacy-bar-chart" className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Supplier Distribution by Category</h2>
            <p className="text-sm text-gray-600 mt-1">
              Number of suppliers providing items for each category
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Total Suppliers: {supplierData.totalSuppliers}</span>
            </div>
            {supplierData?.totals?.totalItems > 0 && (
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Linked Items: {supplierData.totals.totalItems}</span>
              </div>
            )}
          </div>
        </div>
        {renderBarChart()}
        
        {/* Supplier Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {supplierData.categorySuppliers.map((item, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{item.supplierCount}</div>
              <div className="text-xs text-gray-500">
                {item.supplierCount === 1 ? 'Supplier' : 'Suppliers'}
              </div>
              {typeof item.itemCount === 'number' && (
                <div className="text-xs text-gray-400 mt-1">
                  {item.itemCount} linked {item.itemCount === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reports */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Quick Reports</h3>
            <p className="text-sm text-gray-600">
              High-level insights for pharmacists to act fast.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {loadingQuickReports ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Refreshing analytics…</span>
              </>
            ) : (
              <span>
                Last updated {formatDateTime(dailySummary?.generatedAt || new Date())}
              </span>
            )}
          </div>
        </div>

        {loadingQuickReports ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-sm text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-600" aria-hidden="true" />
              Loading quick report analytics…
            </div>
          </div>
        ) : quickReportsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium">Unable to load quick reports.</p>
                <p className="text-sm">{quickReportsError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchPharmacyData}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickReportCards.map(card => {
              const IconComponent = card.icon;
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => handleQuickReportOpen(card.type)}
                  className="group relative flex h-full flex-col rounded-lg border border-gray-200 p-5 text-left transition-all hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {card.primaryValue}
                      </p>
                      <p className="text-xs text-gray-500">{card.primaryLabel}</p>
                    </div>
                    <div className={`rounded-full p-3 ${card.backgroundClass}`} aria-hidden="true">
                      <IconComponent className={`h-5 w-5 ${card.accentClass}`} />
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">{card.description}</p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    {card.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{metric.label}</span>
                        <span className={metric.className || 'font-medium text-gray-900'}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {card.badge && (
                    <div
                      className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyles(card.badge.severity)}`}
                    >
                      {card.badge.text}
                    </div>
                  )}

                  {card.extra && (
                    <p className="mt-3 text-xs font-semibold text-blue-600">
                      {card.extra}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <span>View full report</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {renderQuickReportModal()}
    </div>
  );
};

export default PharmacyReports;
