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
