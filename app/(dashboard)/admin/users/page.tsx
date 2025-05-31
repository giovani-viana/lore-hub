// app/(dashboard)/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Para verificar sessão no cliente se necessário, embora o layout já proteja
import { Role } from '@prisma/client'; // Importar o enum Role

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersResponse {
  message: string;
  users: User[];
  totalUsers: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface EditFormData {
  name: string;
  email: string;
  role: Role;
  password?: string; // Senha é opcional para edição
}

export default function AdminUsers() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    role: Role.USER, // Default role
    password: '', // Opcional para edição
  });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const router = useRouter();
  // Embora o layout/(dashboard)/admin já proteja, em componentes cliente
  // você pode usar useSession para lógica baseada no estado auth no frontend
  // const { data: session, status } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construir a URL com parâmetros de paginação
        const response = await fetch(`/api/admin/users?page=${page}&pageSize=${pageSize}`);
        const data: UsersResponse = await response.json();

        if (!response.ok) {
          // Tratar erros da API (ex: Não autorizado, erro interno)
           // Se for não autorizado, redirecionar para login ou página inicial
          if (response.status === 403) {
               setError('Não autorizado. Você não tem permissão para ver esta página.');
               // Opcional: redirecionar router.push('/login');
          } else {
              setError(data.message || 'Ocorreu um erro ao buscar usuários.');
          }

          setUsersData(null); // Limpa dados em caso de erro
          return;
        }

        setUsersData(data);
      } catch (err: any) {
        console.error('Erro ao buscar usuários:', err);
        setError('Não foi possível conectar ao servidor ou buscar dados.');
        setUsersData(null); // Limpa dados em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, pageSize]); // Refaz a busca quando a página ou o tamanho da página mudam

  // Funções para mudar de página
  const handleNextPage = () => {
    if (usersData && page < usersData.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

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
      role: user.role as Role, // Cast para Role
      password: '', // Não preenche a senha por segurança
    });
  };

  // Lidar com mudança nos campos do formulário de edição
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: name === 'role' ? value as Role : value // Cast para Role se o campo for role
    }));
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

  // Exibir estado de carregamento, erro ou a lista de usuários
  if (loading) {
    return <div className="text-gold">Carregando usuários...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  // Se não houver dados ou usuários na lista após carregar
  if (!usersData || usersData.users.length === 0) {
      return <div className="text-white">Nenhum usuário encontrado.</div>;
  }


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Gerenciar Usuários</h1>

      {/* Tabela de Usuários */}
      <div className="bg-black border border-gold rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gold">
          <thead className="bg-black">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Criado em</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gold text-white">
            {usersData.users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Botões de Ação */}
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-gold hover:text-white mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex justify-between items-center mt-6 text-gold">
        <span>
          Página {usersData.page} de {usersData.totalPages}
        </span>
        <div className="flex space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className={`px-4 py-2 border border-gold rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold hover:text-black transition-colors'}`}
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={usersData.page === usersData.totalPages}
             className={`px-4 py-2 border border-gold rounded-lg ${usersData.page === usersData.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold hover:text-black transition-colors'}`}
          >
            Próxima
          </button>
        </div>
      </div>

       {/* Botão para Criar Usuário - Implementar funcionalidade depois */}
       <div className="mt-6">
           <button className="px-6 py-2 bg-gold text-black font-semibold rounded-lg shadow hover:bg-opacity-90 transition-opacity">
               Criar Novo Usuário
           </button>
       </div>

       {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
  );
}