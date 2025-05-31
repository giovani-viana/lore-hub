import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs'; // Mantenho caso precise para redefinir senha (PUT)

const prisma = new PrismaClient();

// Rota para buscar um usuário por ID (GET)
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  const { userId } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${userId}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar usuário' }, { status: 500 });
  }
}

// Rota para atualizar um usuário por ID (PUT)
export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  const { userId } = params;

  try {
    const body = await request.json();
    const { name, email, role, password } = body; 

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;

    // Validação da Role para PUT
    if (role !== undefined) {
        const validRoles = Object.values(Role);
        if (!validRoles.includes(role)) {
            return NextResponse.json({
                message: `Role inválida. Roles permitidas: ${validRoles.join(', ')}`,
            }, { status: 400 });
        }
    }

    // Se uma nova senha for fornecida, hasheie-a
    if (password !== undefined) {
        dataToUpdate.password = await hash(password, 10);
    }

    // Verifica se há algo para atualizar
    if (Object.keys(dataToUpdate).length === 0) {
         return NextResponse.json({ message: 'Nenhum dado de atualização fornecido' }, { status: 400 });
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Selecione apenas os campos que você precisa expor
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(`Erro ao atualizar usuário ${userId}:`, error);
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'Este email já está em uso' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar usuário' }, { status: 500 });
  }
}

// Rota para deletar um usuário por ID (DELETE)
export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  const { userId } = params;

  try {
    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Usuário deletado com sucesso' }, { status: 200 });
  } catch (error: any) {
    console.error(`Erro ao deletar usuário ${userId}:`, error);
     // Prisma Client Known Request Error: Record to delete does not exist.
     if (error.code === 'P2025') {
         return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
     }
    return NextResponse.json({ message: 'Erro interno do servidor ao deletar usuário' }, { status: 500 });
  }
} 