'use client'

import { useState, useEffect } from 'react'
import { Role } from '@prisma/client'

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface EditFormData {
  name: string;
  email: string;
  role: Role;
  password?: string; // Senha é opcional para edição
}

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0, // Definir padrão como 0, será atualizado pela API
    activeUsers: 120,
    newUsers: 15,
    totalPosts: 45
  })
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    role: Role.USER, // Default role
    password: '', // Opcional para edição
  });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Função para buscar usuários e total
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?page=1&pageSize=10'); // Buscar a primeira página
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: data.totalUsers
      }));
      setUsers(data.users);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao buscar dados de usuários:', error);
      setError('Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Rodar apenas uma vez ao montar

  // Lidar com exclusão de usuário (abrir modal de confirmação)
  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
  };

  // Confirmar e executar a exclusão
  const confirmDelete = async () => {
    if (!deletingUserId) return;

    try {
      const userIdToDelete = deletingUserId;
      setDeletingUserId(null); // Fechar modal imediatamente
      
      const response = await fetch(`/api/admin/users/${userIdToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Atualizar a lista de usuários após a exclusão
      fetchUsers();
    } catch (error) {
      console.error(`Erro ao deletar usuário ${deletingUserId}:`, error);
      alert('Falha ao deletar usuário.');
      setDeletingUserId(null); // Garantir que o modal feche mesmo com erro
    }
  };

  // Lidar com edição de usuário (abrir modal/formulário)
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', 
    });
  };

  // Lidar com mudança nos campos do formulário de edição
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Lidar com o envio do formulário de edição
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Atualizar a lista de usuários e fechar o modal
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${editingUser.id}:`, error);
      alert('Falha ao atualizar usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gold">Dashboard</h1>
        <div className="text-gold">
          Bem-vindo ao painel administrativo
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
          <h3 className="text-gold text-lg font-semibold mb-2">Total de Usuários</h3>
          <p className="text-3xl font-bold text-white">{loading ? 'Carregando...' : stats.totalUsers}</p>
        </div>

        <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
          <h3 className="text-gold text-lg font-semibold mb-2">Usuários Ativos</h3>
          <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
        </div>

        <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
          <h3 className="text-gold text-lg font-semibold mb-2">Novos Usuários</h3>
          <p className="text-3xl font-bold text-white">{stats.newUsers}</p>
        </div>

        <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
          <h3 className="text-gold text-lg font-semibold mb-2">Total de Posts</h3>
          <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
        </div>
      </div>

      {/* Seção de Gerenciamento de Usuários */}
      <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gold mb-4">Gerenciamento de Usuários</h2>
        {loading ? (
          <p className="text-white">Carregando usuários...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Criado Em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-gold">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gold text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 font-semibold">
            Adicionar Usuário
          </button>
          <button className="bg-gold text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 font-semibold">
            Criar Post
          </button>
          <button className="bg-gold text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 font-semibold">
            Gerenciar Permissões
          </button>
        </div>
      </div>

      {/* Seção de Atividades Recentes */}
      <div className="bg-black border border-gold rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gold mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between border-b border-gold pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <div>
                  <p className="text-white">Novo usuário registrado</p>
                  <p className="text-sm text-gray-400">Há 2 horas</p>
                </div>
              </div>
              <button className="text-gold hover:text-opacity-80">
                Ver detalhes
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gold rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gold mb-4">Editar Usuário</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gold">Nome</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-black border border-gold rounded-md text-white focus:outline-none focus:ring-gold focus:border-gold"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gold">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-black border border-gold rounded-md text-white focus:outline-none focus:ring-gold focus:border-gold"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gold">Role</label>
                <select
                  name="role"
                  id="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-black border border-gold rounded-md text-white focus:outline-none focus:ring-gold focus:border-gold"
                  required
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gold">Nova Senha (opcional)</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={editFormData.password}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 bg-black border border-gold rounded-md text-white focus:outline-none focus:ring-gold focus:border-gold"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gold rounded-md text-gold hover:bg-gold hover:text-black transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-black rounded-md hover:bg-opacity-90 transition-all duration-200 font-semibold"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gold rounded-lg p-8 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gold mb-4">Confirmar Exclusão</h2>
            <p className="text-white mb-6">Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setDeletingUserId(null)} // Cancelar
                className="px-4 py-2 border border-gold rounded-md text-gold hover:bg-gold hover:text-black transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete} // Confirmar exclusão
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 