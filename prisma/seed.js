const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Utilisateur Test',
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Utilisateur créé:', user.email);

  // Créer des catégories par défaut
  const categories = [
    'Alimentation',
    'Transport',
    'Logement',
    'Santé',
    'Loisirs',
    'Shopping',
    'Éducation',
    'Services',
    'Autres'
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { 
        name_userId: {
          name: categoryName,
          userId: user.id
        }
      },
      update: {},
      create: {
        name: categoryName,
        userId: user.id,
      },
    });
  }

  console.log('✅ Catégories créées');

  // Créer un compte par défaut
  const account = await prisma.account.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Compte Principal',
      type: 'courant',
      balance: 1000.0,
      userId: user.id,
    },
  });

  console.log('✅ Compte créé:', account.name);

  // Créer quelques dépenses d'exemple
  const alimentationCategory = await prisma.category.findFirst({
    where: { name: 'Alimentation', userId: user.id }
  });

  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transport', userId: user.id }
  });

  const sampleExpenses = [
    {
      amount: 45.50,
      type: 'expense',
      description: 'Courses au supermarché',
      date: new Date('2025-01-05'),
      categoryId: alimentationCategory.id,
      userId: user.id,
      accountId: account.id,
    },
    {
      amount: 12.30,
      type: 'expense', 
      description: 'Ticket de métro',
      date: new Date('2025-01-06'),
      categoryId: transportCategory.id,
      userId: user.id,
      accountId: account.id,
    },
    {
      amount: 25.00,
      type: 'expense',
      description: 'Restaurant midi',
      date: new Date('2025-01-07'),
      categoryId: alimentationCategory.id,
      userId: user.id,
      accountId: account.id,
    }
  ];

  for (const expense of sampleExpenses) {
    await prisma.transaction.create({
      data: expense,
    });
  }

  console.log('✅ Dépenses d\'exemple créées');

  // Créer quelques revenus d'exemple
  const sampleIncomes = [
    {
      amount: 2500.00,
      type: 'income',
      description: 'Salaire janvier',
      date: new Date('2025-01-01'),
      userId: user.id,
      accountId: account.id,
    },
    {
      amount: 150.00,
      type: 'income',
      description: 'Freelance',
      date: new Date('2025-01-03'),
      userId: user.id,
      accountId: account.id,
    }
  ];

  for (const income of sampleIncomes) {
    await prisma.transaction.create({
      data: income,
    });
  }

  console.log('✅ Revenus d\'exemple créés');

  console.log('🎉 Seeding terminé avec succès !');
  console.log('📧 Utilisateur test: test@example.com');
  console.log('🔑 Mot de passe: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
