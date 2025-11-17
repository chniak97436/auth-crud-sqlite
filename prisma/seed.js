const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword', // En production, hash le mot de passe
      name: 'Test User',
    },
  });

  // Créer un post
  const post = await prisma.post.create({
    data: {
      title: 'Test Post',
      content: 'This is a test post.',
      published: true,
      authorId: user.id,
    },
  });

  console.log('User and Post created:', { user, post });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
