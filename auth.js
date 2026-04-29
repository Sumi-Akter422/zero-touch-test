// auth.js — Authentication Service
// This file is used by multiple features — conflict test target

function login(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username and password required" };
  }
  // TODO: connect to database
  return { success: true, token: "abc123", user: username };
}

function logout(token) {
  // TODO: invalidate token
  return { success: true };
}

function validateToken(token) {
  if (!token) return false;
  return token.length > 5;
}

module.exports = { login, logout, validateToken };
