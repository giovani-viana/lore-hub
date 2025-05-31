import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando script de seed...');
  // Criar usuário administrador
  const adminPassword = await hash('admin123456', 8)
  const admin = await prisma.user.upsert({
    where: { email: 'giovaniviana2011@gmail.com' },
    update: {},
    create: {
      email: 'giovaniviana2011@gmail.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log(`Usuário administrador criado com ID: ${admin.id}`);

  // Criar usuário normal
  const userPassword = await hash('user123456', 8)
  const user = await prisma.user.upsert({
    where: { email: 'usuario@exemplo.com' },
    update: {},
    create: {
      email: 'usuario@exemplo.com',
      name: 'Usuário Teste',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log(`Usuário normal criado com ID: ${user.id}`);

  // Criar usuários adicionais para teste de paginação
  const additionalUsers = [];
  for (let i = 1; i <= 10; i++) {
    const email = `usuario${i}@exemplo.com`;
    const name = `Usuário ${i}`;
    const password = await hash(`senha${i}`, 8);

    additionalUsers.push(prisma.user.upsert({
      where: { email: email },
      update: {},
      create: {
        email: email,
        name: name,
        password: password,
        role: 'USER', // Por padrão, cria usuários normais
      },
    }));
  }

  await Promise.all(additionalUsers);
  console.log(`Criados ${additionalUsers.length} usuários adicionais.`);

  // Criar campanha
  const campaign = await prisma.campaign.upsert({
    where: { id: 'campaign-1' },
    update: {},
    create: {
      id: 'campaign-1',
      title: 'Aventura Inicial',
      description: 'Uma campanha para iniciantes',
      players: {
        connect: [
          { id: admin.id },
          { id: user.id }
        ]
      },
      masterId: admin.id, // Definindo o administrador como mestre
    },
  })

  console.log(`Campanha criada com ID: ${campaign.id}`);

  // Criar personagem para o usuário
  const character = await prisma.characters.upsert({
    where: { id: 'character-1' },
    update: {},
    create: {
      id: 'character-1',
      name: 'Aragorn',
      picture: 'https://exemplo.com/aragorn.jpg',
      slug: 'aragorn',
      author: {
        connect: { id: user.id }
      },
      campaign: {
        connect: { id: campaign.id }
      },
      attributes: {
        create: [
          {
            name: 'Força',
            value: '15',
            visibility: 'CAMPAIGN_PLAYERS', // Definindo visibilidade padrão
          },
          {
            name: 'Destreza',
            value: '14',
            visibility: 'CAMPAIGN_PLAYERS', // Definindo visibilidade padrão
          },
          {
            name: 'Constituição',
            value: '13',
            visibility: 'CAMPAIGN_PLAYERS', // Definindo visibilidade padrão
          }
        ]
      },
      inventory: {
        create: [
          {
            name: 'Espada Longa',
            description: 'Uma espada ancestral',
            quantity: 1,
            visibility: 'CAMPAIGN_PLAYERS', // Definindo visibilidade padrão
          },
          {
            name: 'Poção de Cura',
            description: 'Restaura 2d4+2 pontos de vida',
            quantity: 3,
            visibility: 'CAMPAIGN_PLAYERS', // Definindo visibilidade padrão
          }
        ]
      }
    },
  })

  console.log(`Personagem criado com ID: ${character.id}`);

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 