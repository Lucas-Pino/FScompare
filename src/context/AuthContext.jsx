import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  { id: 1, email: 'admin@puravida.cl', password: 'admin', role: 'admin', name: 'Administrador' },
  { id: 2, email: 'user@puravida.cl', password: 'user', role: 'viewer', name: 'Usuario Demo' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('pv_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pv_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('pv_users', JSON.stringify(users));
  }, [users]);

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('pv_current_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, message: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pv_current_user');
  };

  const addUser = (newUser) => {
    const cleanEmail = newUser.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Ya existe un usuario con este email" };
    }
    setUsers(prevUsers => {
      const id = Math.max(0, ...prevUsers.map(u => u.id)) + 1;
      return [...prevUsers, { ...newUser, email: cleanEmail, id }];
    });
    return { success: true };
  };

  const updateUser = (id, updatedData) => {
    const cleanEmail = updatedData.email.trim().toLowerCase();
    if (users.some(u => u.id !== id && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Ya existe otro usuario con este email" };
    }
    setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, ...updatedData, email: cleanEmail } : u));
    if (user && user.id === id) {
        const { password, ...rest } = { ...user, ...updatedData, email: cleanEmail };
        setUser(rest);
        localStorage.setItem('pv_current_user', JSON.stringify(rest));
    }
    return { success: true };
  };

  const deleteUser = (id) => {
    if (users.length <= 1) return { success: false, message: "No se puede eliminar el último usuario" };
    if (user && user.id === id) return { success: false, message: "No puedes eliminar tu propio usuario" };
    setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
