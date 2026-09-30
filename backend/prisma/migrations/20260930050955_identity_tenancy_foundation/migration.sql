-- CreateEnum
CREATE TYPE "AccountPlane" AS ENUM ('PLATFORM', 'SCHOOL');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OrganizationStatusSource" AS ENUM ('MANUAL', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "SignupSource" AS ENUM ('PLATFORM', 'SELF_SERVICE');

-- CreateEnum
CREATE TYPE "AuditActorPlane" AS ENUM ('PLATFORM', 'SCHOOL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'DENIED');

-- AlterEnum
ALTER TYPE "ScopeType" ADD VALUE 'branch';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "onboardedBy" INTEGER,
ADD COLUMN     "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "signupSource" "SignupSource" NOT NULL DEFAULT 'PLATFORM',
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "statusChangedAt" TIMESTAMP(3),
ADD COLUMN     "statusChangedBy" INTEGER,
ADD COLUMN     "statusReason" VARCHAR(255),
ADD COLUMN     "statusSource" "OrganizationStatusSource" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "isPlatformOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSensitive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module" VARCHAR(50);

-- AlterTable
ALTER TABLE "user_has_permissions" ADD COLUMN     "branchId" INTEGER,
ADD COLUMN     "grantedAt" TIMESTAMP(3),
ADD COLUMN     "grantedBy" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "reason" VARCHAR(255),
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_has_roles" ADD COLUMN     "branchId" INTEGER,
ADD COLUMN     "grantedAt" TIMESTAMP(3),
ADD COLUMN     "grantedBy" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "revokeReason" VARCHAR(255),
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedBy" INTEGER,
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accessVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "accountPlane" "AccountPlane" NOT NULL DEFAULT 'SCHOOL',
ADD COLUMN     "identitySubject" VARCHAR(64),
ADD COLUMN     "publicId" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" INTEGER,
    "actorPlane" "AuditActorPlane" NOT NULL,
    "supportSessionId" INTEGER,
    "organizationId" INTEGER,
    "branchId" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "targetType" VARCHAR(60),
    "targetId" INTEGER,
    "changeSummary" JSONB,
    "reason" VARCHAR(500),
    "outcome" "AuditOutcome" NOT NULL,
    "ipAddress" VARCHAR(45),
    "deviceInfo" VARCHAR(255),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_occurred_at" ON "audit_logs"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at" ON "audit_logs"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "branches_organization_id_id_unique" ON "branches"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_public_id_unique" ON "organizations"("publicId");

-- CreateIndex
CREATE INDEX "user_has_permissions_org_branch" ON "user_has_permissions"("organizationId", "branchId");

-- CreateIndex
CREATE INDEX "user_has_roles_org_branch" ON "user_has_roles"("organizationId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_unique" ON "users"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "users_identity_subject_unique" ON "users"("identitySubject");

-- AddForeignKey
ALTER TABLE "user_has_roles" ADD CONSTRAINT "user_has_roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_has_roles" ADD CONSTRAINT "user_has_roles_organizationId_branchId_fkey" FOREIGN KEY ("organizationId", "branchId") REFERENCES "branches"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_has_permissions" ADD CONSTRAINT "user_has_permissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_has_permissions" ADD CONSTRAINT "user_has_permissions_organizationId_branchId_fkey" FOREIGN KEY ("organizationId", "branchId") REFERENCES "branches"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Hand-written part of sub-phase 2.1 (reviewed before first apply; see docs/phases/2.1-prisma-foundation.md).
-- Generated with `prisma migrate diff --from-config-datasource --to-schema` because `migrate dev` refuses to run
-- non-interactively.
-- ─────────────────────────────────────────────────────────────────────────────

-- Backfill: organization status follows the existing isActive flag (isActive stays authoritative until 5.1).
UPDATE "organizations" SET "status" = 'INACTIVE' WHERE "isActive" = false;

-- Backfill: a permission's module is its resource (design §4.3; the column becomes required in 4.4).
UPDATE "permissions" SET "module" = "resource" WHERE "module" IS NULL;

-- Backfill: users holding a primary or secondary role are platform staff.
UPDATE "users" u SET "accountPlane" = 'PLATFORM'
WHERE EXISTS (
  SELECT 1 FROM "user_has_roles" ur JOIN "roles" r ON r."id" = ur."roleId"
  WHERE ur."userId" = u."id" AND r."roleType" IN ('primary', 'secondary')
);

-- Backfill: organization-scoped assignments get their explicit organization (scopeId pointed at it).
UPDATE "user_has_roles" ur SET "organizationId" = ur."scopeId"
WHERE ur."scopeType" = 'organization' AND ur."scopeId" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "organizations" o WHERE o."id" = ur."scopeId");

UPDATE "user_has_permissions" up SET "organizationId" = up."scopeId"
WHERE up."scopeType" = 'organization' AND up."scopeId" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "organizations" o WHERE o."id" = up."scopeId");

-- audit_logs is append-only (design §4.9). TRUNCATE (used only by the test helper on the test database) is not a
-- row-level operation and is not blocked.
CREATE OR REPLACE FUNCTION "audit_logs_append_only"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not allowed', TG_OP;
END;
$$;

CREATE TRIGGER "audit_logs_append_only"
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION "audit_logs_append_only"();

