import { beforeEach, afterEach } from "vitest";
import prisma from "../../src/database";

export function cleanDatabase() {
  const clean = async () => {
    // TODO: when migrate to postgres,
    // replace below with
    // https://www.prisma.io/docs/concepts/components/prisma-client/crud#deleting-all-data-with-raw-sql--truncate
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.coreUnit.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.operation.deleteMany();
    await prisma.document.deleteMany();
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
