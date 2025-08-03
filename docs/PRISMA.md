# Prisma Schema Relationship Usage Guide

## Overview

Prisma supports three main relationship types:

- **One-to-One**
- **One-to-Many**
- **Many-to-Many**

## 1. One-to-One Relationship

### Basic Syntax

```prisma
model User {
  id      String  @id @default(uuid())
  email   String  @unique
  profile Profile? // Optional one-to-one relationship
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  userId String @unique // Key: use @unique to ensure one-to-one
  user   User   @relation(fields: [userId], references: [id])
}
```

### Characteristics

- Use `@unique` constraint to ensure one-to-one relationship
- Relationship field can be optional (`Profile?`) or required (`Profile`)

### Usage Examples

```typescript
// Create user and profile
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    profile: {
      create: {
        bio: "Hello World",
      },
    },
  },
  include: {
    profile: true,
  },
});

// Query user with profile
const userWithProfile = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true },
});
```

## 2. One-to-Many Relationship

### Basic Syntax

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  posts Post[] // One user has multiple posts
}

model Post {
  id       String @id @default(uuid())
  title    String
  authorId String // Foreign key
  author   User   @relation(fields: [authorId], references: [id])
}
```

### Characteristics

- Parent model uses array type (`Post[]`)
- Child model contains foreign key field and relationship field

### Usage Examples

```typescript
// Create user and posts
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    posts: {
      create: [{ title: "First Post" }, { title: "Second Post" }],
    },
  },
  include: {
    posts: true,
  },
});

// Query all posts by user
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true },
});

// Query post with author
const postWithAuthor = await prisma.post.findUnique({
  where: { id: postId },
  include: { author: true },
});
```

## 3. Many-to-Many Relationship

### 3.1 Implicit Many-to-Many Relationship

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  tags  Tag[]  // One user has multiple tags
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  users User[] // One tag belongs to multiple users
}
```

### 3.2 Explicit Many-to-Many Relationship (Recommended)

```prisma
model User {
  id      String     @id @default(uuid())
  email   String     @unique
  userTags UserTag[] // Associated via intermediate table
}

model Tag {
  id      String     @id @default(uuid())
  name    String     @unique
  userTags UserTag[] // Associated via intermediate table
}

model UserTag {
  id     String   @id @default(uuid())
  userId String
  tagId  String
  assignedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@unique([userId, tagId]) // Prevent duplicate associations
}
```

### Usage Examples

```typescript
// Implicit Many-to-Many
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    tags: {
      connect: [{ name: "developer" }, { name: "designer" }],
    },
  },
  include: { tags: true },
});

// Explicit Many-to-Many
const userTag = await prisma.userTag.create({
  data: {
    user: { connect: { id: userId } },
    tag: { connect: { id: tagId } },
  },
  include: {
    user: true,
    tag: true,
  },
});
```

## 4. Relationship Configuration Options

### 4.1 onDelete Behavior

```prisma
model Post {
  id       String @id @default(uuid())
  title    String
  authorId String
  author   User   @relation(
    fields: [authorId],
    references: [id],
    onDelete: Cascade // Cascade delete posts when user is deleted
  )
}
```

**Options:**

- `Cascade`: Cascade delete child records when parent record is deleted
- `Restrict`: Prevent deletion of parent records with child records
- `SetNull`: Set foreign key to null when parent record is deleted
- `NoAction`: Take no action (default)

### 4.2 onUpdate Behavior

```prisma
model Post {
  id       String @id @default(uuid())
  title    String
  authorId String
  author   User   @relation(
    fields: [authorId],
    references: [id],
    onUpdate: Cascade // Cascade update posts when user ID is updated
  )
}
```

## 5. Indexes and Constraints

### 5.1 Foreign Key Indexes

```prisma
model Post {
  id       String @id @default(uuid())
  title    String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])

  @@index([authorId]) // Create index for foreign key
}
```

### 5.2 Composite Unique Constraints

```prisma
model UserTag {
  id     String @id @default(uuid())
  userId String
  tagId  String

  user User @relation(fields: [userId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@unique([userId, tagId]) // Prevent duplicate associations
}
```

## 6. Self-Referential Relationships

```prisma
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?    // Parent category ID
  parent   Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children Category[] @relation("CategoryToCategory") // Child categories
}
```

## 7. Best Practices

### 7.1 Naming Conventions

- Foreign key fields are usually named `{modelName}Id`
- Relationship fields use model name (singular) or plural form

### 7.2 Performance Optimization

- Create indexes for foreign key fields
- Use `select` and `include` to control query fields
- Avoid N+1 query issues

### 7.3 Data Integrity

- Use appropriate `onDelete` and `onUpdate` behaviors
- Add unique constraints in many-to-many relationships
- Consider using explicit intermediate tables instead of implicit relationships

## 8. Common Query Patterns

### 8.1 Nested Creation

```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    profile: {
      create: { bio: "Hello" },
    },
    posts: {
      create: [{ title: "Post 1" }, { title: "Post 2" }],
    },
  },
});
```

### 8.2 Nested Update

```typescript
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    profile: {
      upsert: {
        create: { bio: "New bio" },
        update: { bio: "Updated bio" },
      },
    },
  },
});
```

### 8.3 Relationship Queries

```typescript
// Include relationship data
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    posts: {
      include: {
        comments: true,
      },
    },
  },
});

// Conditional queries
const posts = await prisma.post.findMany({
  where: {
    author: {
      email: "user@example.com",
    },
  },
});
```

## 9. Migration and Deployment

### 9.1 Generate Migrations

```bash
npx prisma migrate dev --name add-relations
```

### 9.2 Reset Database

```bash
npx prisma migrate reset
```

### 9.3 Generate Client

```bash
npx prisma generate
```

This guide covers the main usage and best practices of Prisma relationships. Based on your specific needs, choose the appropriate relationship type and configuration options.
