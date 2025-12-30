const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

function getPrismaClient() {
  try {
    // Dynamic import to handle case where Prisma Client isn't generated
    const { PrismaClient } = require("@prisma/client");
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
  } catch (error: any) {
    if (error.message?.includes("did not initialize")) {
      console.warn(
        "Prisma Client not initialized. Run 'prisma generate' to initialize it."
      );
    }
    return null;
  }
}

export const prisma = getPrismaClient();
