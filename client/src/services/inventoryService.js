import api from './api';

export const inventoryService = {
  // Inventory Items
  getInventoryItems: (businessId) => api.get(`/inventory/items?businessId=${businessId}`),
  createInventoryItem: (data) => api.post('/inventory/item', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/item/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/inventory/item/${id}`),
  getInventoryItem: (id) => api.get(`/inventory/item/${id}`),

  // Inventory Movements
  recordInventoryMovement: (data) => api.post('/inventory/movement', data),
  getInventoryMovements: (businessId, itemId) => 
    api.get(`/inventory/movements?businessId=${businessId}&itemId=${itemId}`),

  // Inventory Valuation
  getInventoryValuation: (businessId, asOfDate) => 
    api.get(`/inventory/valuation?businessId=${businessId}&asOfDate=${asOfDate}`),

  // Low Stock Report
  getLowStockReport: (businessId) => api.get(`/inventory/low-stock?businessId=${businessId}`),

  // Locations
  getLocations: (businessId) => api.get(`/inventory/locations?businessId=${businessId}`),
  createLocation: (data) => api.post('/inventory/location', data),
  updateLocation: (id, data) => api.put(`/inventory/location/${id}`, data),
  deleteLocation: (id) => api.delete(`/inventory/location/${id}`),

  // Purchase Orders
  getPurchaseOrders: (businessId) => api.get(`/inventory/purchase-orders?businessId=${businessId}`),
  createPurchaseOrder: (data) => api.post('/inventory/purchase-order', data),
  updatePurchaseOrder: (id, data) => api.put(`/inventory/purchase-order/${id}`, data),
  deletePurchaseOrder: (id) => api.delete(`/inventory/purchase-order/${id}`),

  // Sales Orders
  getSalesOrders: (businessId) => api.get(`/inventory/sales-orders?businessId=${businessId}`),
  createSalesOrder: (data) => api.post('/inventory/sales-order', data),
  updateSalesOrder: (id, data) => api.put(`/inventory/sales-order/${id}`, data),
  deleteSalesOrder: (id) => api.delete(`/inventory/sales-order/${id}`),
}; 