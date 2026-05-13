// utils.js — Shared Utilities

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function isEmpty(value) {
  return value === null || value === undefined || value === "";
}

module.exports = { formatDate, generateId, isEmpty };
export function helper() {}
export function calculateTotal(items) { return items.reduce((sum, i) => sum + i.price, 0); }
export function helper2() {}
export function helper3() {}
