import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// ===== FILE PATH =====
const usersFile = path.resolve("users.json");
const rolesFile = path.resolve("roles.json");

// ===== HELPER FUNCTIONS =====
const readJSON = (file) =>
  JSON.parse(fs.readFileSync(file, "utf-8"));

const writeJSON = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ===== ROLE APIs =====

// Get all roles
app.get("/api/roles", (req, res) => {
  const roles = readJSON(rolesFile);
  res.json(roles);
});

// Add role
app.post("/api/roles", (req, res) => {
  const roles = readJSON(rolesFile);

  const role = {
    ...req.body,
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  roles.push(role);
  writeJSON(rolesFile, roles);

  res.status(201).json(role);
});

// Update role
app.put("/api/roles/:id", (req, res) => {
  const roles = readJSON(rolesFile);
  const role = roles.find(r => r.id === req.params.id);

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  Object.assign(role, req.body, {
    updatedAt: new Date().toISOString()
  });

  writeJSON(rolesFile, roles);
  res.json(role);
});

// Delete role
app.delete("/api/roles/:id", (req, res) => {
  const roles = readJSON(rolesFile);
  const index = roles.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Role not found" });
  }

  roles.splice(index, 1);
  writeJSON(rolesFile, roles);

  res.json({ message: "Role deleted" });
});

// ===== USER APIs =====

// Get all users
app.get("/api/users", (req, res) => {
  const users = readJSON(usersFile);
  res.json(users);
});

// Add user
app.post("/api/users", (req, res) => {
  const users = readJSON(usersFile);
  const roles = readJSON(rolesFile);

  const role = roles.find(r => r.id === req.body.roleId);
  if (!role) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const roleForUser = {
    id: role.id,
    name: role.name,
    description: role.description
  };

  const user = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    fullName: req.body.fullName,
    avatarUrl: req.body.avatarUrl || "",
    status: req.body.status ?? true,
    loginCount: 0,
    role: roleForUser,
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(user);
  writeJSON(usersFile, users);

  res.status(201).json(user);
});

// Update user
app.put("/api/users/:username", (req, res) => {
  const users = readJSON(usersFile);
  const roles = readJSON(rolesFile);

  const user = users.find(u => u.username === req.params.username);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.body.roleId) {
    const role = roles.find(r => r.id === req.body.roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    user.role = {
      id: role.id,
      name: role.name,
      description: role.description
    };
  }

  Object.assign(user, req.body, {
    updatedAt: new Date().toISOString()
  });

  writeJSON(usersFile, users);
  res.json(user);
});

// Delete user
app.delete("/api/users/:username", (req, res) => {
  const users = readJSON(usersFile);
  const index = users.findIndex(u => u.username === req.params.username);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(index, 1);
  writeJSON(usersFile, users);

  res.json({ message: "User deleted" });
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});