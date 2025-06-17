-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "custom";

-- CreateTable
CREATE TABLE "custom"."AuthUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "password" TEXT,
    "allergies" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom"."FoodItemsStatus" (
    "id" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodItemsStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "custom"."User"("email");

-- AddForeignKey
ALTER TABLE "custom"."User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "custom"."AuthUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom"."FoodItemsStatus" ADD CONSTRAINT "FoodItemsStatus_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "custom"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
