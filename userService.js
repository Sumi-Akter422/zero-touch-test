// userService.js — User Service (shared)
// Modifying this without tests triggers Feature 19 warning

function getUser(id) {
  // TODO: fetch from database
  return { id, name: "John Doe", email: "john@example.com" };
}

function createUser(name, email, password) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }
  return { id: Date.now(), name, email, createdAt: new Date() };
}

function updateUser(id, data) {
  return { id, ...data, updatedAt: new Date() };
}

function deleteUser(id) {
  return { deleted: true, id };
}

module.exports = { getUser, createUser, updateUser, deleteUser };
