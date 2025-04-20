-- CreateTable
CREATE TABLE "FoodItemsStatus" (
    "id" SERIAL NOT NULL,
    "foodName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "FoodItemsStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodItemsStatus" ADD CONSTRAINT "FoodItemsStatus_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
