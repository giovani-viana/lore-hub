# Lore Hub

Uma plataforma moderna de conhecimento construída com Next.js.

## Estrutura do Projeto

```
lore-hub/
├── app/                      # Diretório principal do Next.js
│   ├── (auth)/              # Grupo de rotas autenticadas
│   │   ├── dashboard/       # Páginas do dashboard
│   │   └── profile/         # Páginas de perfil
│   ├── api/                 # Rotas da API (backend)
│   │   ├── auth/           # Endpoints de autenticação
│   │   └── [resource]/     # Outros endpoints da API
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes de UI básicos
│   │   └── features/      # Componentes específicos de features
│   ├── lib/               # Utilitários e configurações
│   │   ├── utils/        # Funções utilitárias
│   │   └── config/       # Configurações do app
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Estilos globais e temas
│   ├── types/            # Definições de tipos TypeScript
│   ├── services/         # Serviços e integrações
│   │   ├── api/         # Clientes de API
│   │   └── external/    # Integrações externas
│   ├── store/           # Gerenciamento de estado
│   └── middleware.ts    # Middleware do Next.js
├── prisma/              # Schema e migrações do Prisma
├── public/             # Arquivos estáticos
├── tests/              # Testes
│   ├── unit/          # Testes unitários
│   ├── integration/   # Testes de integração
│   └── e2e/           # Testes end-to-end
└── docs/              # Documentação do projeto
```

## Tecnologias Utilizadas

- Next.js 13+
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- Jest (Testes)

## Como Iniciar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm start` - Inicia o servidor de produção
- `npm run test` - Executa os testes
- `npm run lint` - Executa o linter

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
