-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "tendency" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardMarkets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "DashboardMarkets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_marketId_date_key" ON "MarketData"("marketId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardMarkets_userId_marketId_key" ON "DashboardMarkets"("userId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardMarkets_userId_index_key" ON "DashboardMarkets"("userId", "index");

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardMarkets" ADD CONSTRAINT "DashboardMarkets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardMarkets" ADD CONSTRAINT "DashboardMarkets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
