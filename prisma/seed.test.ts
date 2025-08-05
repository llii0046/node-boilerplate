import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test database...");

  // Clean up existing data
  await prisma.userTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: "test1@example.com",
      name: "Test User 1",
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "test2@example.com",
      name: "Test User 2",
      isActive: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "test3@example.com",
      name: "Test User 3",
      isActive: false,
    },
  });

  console.log("✅ Test users created:", { user1: user1.email, user2: user2.email, user3: user3.email });

  // Create test categories
  const category1 = await prisma.category.create({
    data: {
      name: "Technology",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Business",
    },
  });

  console.log("✅ Test categories created:", { category1: category1.name, category2: category2.name });

  // Create test posts
  const post1 = await prisma.post.create({
    data: {
      title: "Test Post 1",
      content: "This is a test post content",
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Test Post 2",
      content: "Another test post content",
      published: false,
      authorId: user2.id,
    },
  });

  console.log("✅ Test posts created:", { post1: post1.title, post2: post2.title });

  // Create test comments
  await prisma.comment.create({
    data: {
      content: "Great post!",
      authorId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thanks for sharing",
      authorId: user1.id,
      postId: post2.id,
    },
  });

  console.log("✅ Test comments created");

  // Create test tags
  const tag1 = await prisma.tag.create({
    data: {
      name: "javascript",
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: "typescript",
    },
  });

  console.log("✅ Test tags created:", { tag1: tag1.name, tag2: tag2.name });

  // Associate users with categories
  await prisma.user.update({
    where: { id: user1.id },
    data: {
      categories: {
        connect: [{ id: category1.id }, { id: category2.id }],
      },
    },
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: {
      categories: {
        connect: [{ id: category1.id }],
      },
    },
  });

  console.log("✅ User-category associations created");

  // Associate posts with tags
  await prisma.post.update({
    where: { id: post1.id },
    data: {
      tags: {
        connect: [{ id: tag1.id }, { id: tag2.id }],
      },
    },
  });

  await prisma.post.update({
    where: { id: post2.id },
    data: {
      tags: {
        connect: [{ id: tag1.id }],
      },
    },
  });

  console.log("✅ Post-tag associations created");

  // Associate users with tags
  await prisma.userTag.create({
    data: {
      userId: user1.id,
      tagId: tag1.id,
    },
  });

  await prisma.userTag.create({
    data: {
      userId: user2.id,
      tagId: tag2.id,
    },
  });

  console.log("✅ User-tag associations created");

  console.log("🎉 Test database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding test database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 