# Documentação do Banco de Dados

## Visão Geral

O Lore Hub utiliza PostgreSQL como banco de dados principal, com Prisma como ORM. A estrutura do banco de dados foi projetada para suportar um sistema de RPG com campanhas, personagens, atributos e inventário.

## Modelos

### User
- Representa os usuários da plataforma
- Campos principais:
  - `id`: Identificador único (CUID)
  - `name`: Nome do usuário
  - `email`: Email único
  - `password`: Senha criptografada
  - `role`: Papel do usuário (USER, ADMIN, MODERATOR)
  - Relacionamentos: characters, campaigns

### Characters
- Representa os personagens dos jogadores
- Campos principais:
  - `id`: Identificador único (CUID)
  - `name`: Nome do personagem
  - `picture`: URL da imagem do personagem
  - `slug`: URL amigável única
  - Relacionamentos: author (User), campaign, attributes, inventory

### Campaign
- Representa as campanhas de RPG
- Campos principais:
  - `id`: Identificador único (CUID)
  - `title`: Título da campanha
  - `description`: Descrição da campanha
  - Relacionamentos: players (User[]), characters

### Attribute
- Representa os atributos dos personagens
- Campos principais:
  - `id`: Identificador único (CUID)
  - `name`: Nome do atributo
  - `value`: Valor do atributo
  - Relacionamentos: character (Characters)

### Inventory
- Representa os itens no inventário do personagem
- Campos principais:
  - `id`: Identificador único (CUID)
  - `name`: Nome do item
  - `description`: Descrição do item
  - `quantity`: Quantidade do item
  - `isPublic`: Visibilidade do item
  - Relacionamentos: character (Characters)

## Relacionamentos

1. **User -> Characters**: Um usuário pode ter vários personagens (1:N)
2. **User -> Campaign**: Um usuário pode participar de várias campanhas (N:M)
3. **Campaign -> Characters**: Uma campanha pode ter vários personagens (1:N)
4. **Characters -> Attribute**: Um personagem pode ter vários atributos (1:N)
5. **Characters -> Inventory**: Um personagem pode ter vários itens no inventário (1:N)

## Índices e Restrições

1. Email de usuário é único
2. Slug de personagem é único
3. Cada personagem pertence a um usuário e uma campanha
4. Atributos e itens do inventário pertencem a um personagem específico

## Migrações

Para criar uma nova migração:
```bash
npx prisma migrate dev --name nome_da_migracao
```

Para aplicar migrações em produção:
```bash
npx prisma migrate deploy
```

## Seeds

O banco de dados inclui seeds para dados iniciais:
- Usuário administrador
- Usuário de teste
- Campanha de exemplo
- Personagem de exemplo com atributos e inventário

Para executar os seeds:
```bash
npx prisma db seed
```

## Controle de Acesso

1. **Usuários**:
   - USER: Acesso básico à plataforma
   - MODERATOR: Pode moderar conteúdo
   - ADMIN: Acesso total ao sistema

2. **Inventário**:
   - Por padrão, itens são privados
   - Apenas o dono do personagem, moderadores e admins podem ver itens privados
   - Itens marcados como `isPublic` são visíveis para todos

## Exemplos de Uso

### Criar um novo personagem
```typescript
const character = await prisma.characters.create({
  data: {
    name: 'Nome do Personagem',
    picture: 'url_da_imagem',
    slug: 'nome-do-personagem',
    author: { connect: { id: userId } },
    campaign: { connect: { id: campaignId } },
    attributes: {
      create: [
        { name: 'Força', value: '15' },
        { name: 'Destreza', value: '14' }
      ]
    }
  }
});
```

### Adicionar item ao inventário
```typescript
const item = await prisma.inventory.create({
  data: {
    name: 'Espada',
    description: 'Uma espada afiada',
    quantity: 1,
    isPublic: true,
    character: { connect: { id: characterId } }
  }
});
``` 