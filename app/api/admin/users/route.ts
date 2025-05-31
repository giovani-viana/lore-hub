// app/api/admin/users/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Rota para listar usuários com paginação (GET)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  // Obter parâmetros de paginação da URL
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10); // Página atual (padrão 1)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // Itens por página (padrão 10)

  // Calcular skip e take
  const take = pageSize > 0 && pageSize <= 100 ? pageSize : 10; // Limitar pageSize para evitar sobrecarga
  const skip = (page > 0 ? page - 1 : 0) * take;

  try {
    // Consultar usuários com paginação
    const users = await prisma.user.findMany({
      skip: skip,
      take: take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Obter o total de usuários (para calcular total de páginas no frontend)
    const totalUsers = await prisma.user.count();

    // Retornar lista paginada e total
    return NextResponse.json({
      users: users,
      totalUsers: totalUsers,
      page: page,
      pageSize: take,
      totalPages: Math.ceil(totalUsers / take),
    });
  } catch (error) {
    console.error('Erro ao buscar usuários com paginação:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar usuários' }, { status: 500 });
  }
}

// Rota para criar um novo usuário
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    // Validação da Role
    const validRoles = Object.values(Role); // Obtém os valores válidos do enum Role
    if (role && !validRoles.includes(role)) {
        return NextResponse.json({
            message: `Role inválida. Roles permitidas: ${validRoles.join(', ')}`,
        }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER', // Usa a role fornecida se válida, caso contrário, define como USER
      },
    });

    const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
    };

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'Este email já está em uso' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao criar usuário' }, { status: 500 });
  }
}
