// dashboard.js — Dashboard Controller
// This file is used by multiple features — conflict test target

function getDashboardData(userId) {
  return {
    userId,
    stats: {
      totalOrders: 0,
      revenue: 0,
      activeUsers: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function updateWidget(widgetId, data) {
  // TODO: save to database
  return { updated: true, widgetId };
}

function getChartData(type, from, to) {
  // TODO: fetch from database
  return { type, data: [], from, to };
}

module.exports = { getDashboardData, updateWidget, getChartData };
