import api from './api';

export const analyticsService = {
  // KPIs
  getKPIs: (businessId, period = 'current') => 
    api.get(`/analytics/kpis?businessId=${businessId}&period=${period}`),

  // Cash Flow Report
  getCashFlowReport: (businessId, period = 'current') => 
    api.get(`/analytics/cash-flow?businessId=${businessId}&period=${period}`),

  // Profitability Analysis
  getProfitabilityAnalysis: (businessId, period = 'current') => 
    api.get(`/analytics/profitability?businessId=${businessId}&period=${period}`),

  // Trend Analysis
  getTrendAnalysis: (businessId, metric, periods = 12) => 
    api.get(`/analytics/trends?businessId=${businessId}&metric=${metric}&periods=${periods}`),

  // Business Metrics
  getBusinessMetrics: (businessId) => 
    api.get(`/analytics/business-metrics?businessId=${businessId}`),

  // Export Reports
  exportAnalyticsReport: (businessId, reportType, period) => 
    api.get(`/analytics/export?businessId=${businessId}&reportType=${reportType}&period=${period}`, {
      responseType: 'blob'
    }),
}; 