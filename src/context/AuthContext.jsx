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
    const foundUser = users.find(u => u.email === email && u.password === password);
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
    const id = Math.max(0, ...users.map(u => u.id)) + 1;
    setUsers([...users, { ...newUser, id }]);
  };

  const updateUser = (id, updatedData) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedData } : u));
    if (user && user.id === id) {
        const { password, ...rest } = { ...user, ...updatedData };
        setUser(rest);
        localStorage.setItem('pv_current_user', JSON.stringify(rest));
    }
  };

  const deleteUser = (id) => {
    if (users.length <= 1) return { success: false, message: "No se puede eliminar el último usuario" };
    setUsers(users.filter(u => u.id !== id));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
