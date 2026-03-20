import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Trash2, Edit2, Shield, Eye, Save, X } from 'lucide-react';

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [message, setMessage] = useState(null);

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ ...user, password: '' });
    setMessage(null);
  };

  const handleDelete = (id) => {
    const result = deleteUser(id);
    if (!result.success) {
      setMessage({ type: 'error', text: result.message });
    } else {
      setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    let result;
    if (editingId) {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      result = updateUser(editingId, updateData);
      if (result.success) {
        setEditingId(null);
        setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
      }
    } else {
      result = addUser(formData);
      if (result.success) {
        setShowAddForm(false);
        setMessage({ type: 'success', text: 'Usuario creado correctamente' });
      }
    }

    if (result && !result.success) {
      setMessage({ type: 'error', text: result.message });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'viewer' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm">Administra los accesos al dashboard</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: '', email: '', password: '', role: 'viewer' }); setMessage(null); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center animate-in fade-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          <div className={`w-2 h-2 rounded-full mr-3 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {message.text}
        </div>
      )}

      {(showAddForm || editingId) && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
              {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <button onClick={() => { setEditingId(null); setShowAddForm(false); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre completo"
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required={!editingId}
            />
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="viewer">Visualizador</option>
              <option value="admin">Administrador</option>
            </select>
            <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => { setEditingId(null); setShowAddForm(false); }}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" /> Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {u.role === 'admin' ? 'Administrador' : 'Visualizador'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={currentUser.id === u.id}
                      className={`p-2 rounded-lg transition-all ${currentUser.id === u.id ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                      title={currentUser.id === u.id ? "No puedes eliminar tu propio usuario" : "Eliminar usuario"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
