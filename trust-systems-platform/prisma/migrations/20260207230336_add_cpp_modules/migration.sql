-- CreateTable
CREATE TABLE "CppModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CppExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedHours" INTEGER NOT NULL DEFAULT 4,
    "filesRequired" TEXT NOT NULL DEFAULT '[]',
    "skillsSummary" TEXT NOT NULL DEFAULT '',
    "markdownContent" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL,
    CONSTRAINT "CppExercise_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CppModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCppExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "defenseDate" DATETIME,
    "defenseScore" INTEGER,
    "gitRepoLink" TEXT,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCppExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCppExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "CppExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CppSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "unlockExercise" TEXT,
    "careerValue" TEXT NOT NULL DEFAULT '',
    "proofCriteria" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "UserCppSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'locked',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "firstUsedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCppSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCppSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "CppSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CppFlashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleNumber" INTEGER NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT 'concept',
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "exerciseSlug" TEXT
);

-- CreateTable
CREATE TABLE "UserCppFlashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "intervalDays" REAL NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" DATETIME,
    "lapseCount" INTEGER NOT NULL DEFAULT 0,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCppFlashcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCppFlashcard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CppFlashcard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CppFlashcardReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userFlashcardId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "prevInterval" REAL NOT NULL,
    "newInterval" REAL NOT NULL,
    "prevEase" REAL NOT NULL,
    "newEase" REAL NOT NULL,
    "responseMs" INTEGER,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CppFlashcardReview_userFlashcardId_fkey" FOREIGN KEY ("userFlashcardId") REFERENCES "UserCppFlashcard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PeerEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluatorId" TEXT NOT NULL,
    "evaluatedUserId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "evaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PeerEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_evaluatedUserId_fkey" FOREIGN KEY ("evaluatedUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "CppExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CppModule_number_key" ON "CppModule"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CppModule_slug_key" ON "CppModule"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CppExercise_slug_key" ON "CppExercise"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CppExercise_moduleId_number_key" ON "CppExercise"("moduleId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "UserCppExercise_userId_exerciseId_key" ON "UserCppExercise"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "CppSkill_slug_key" ON "CppSkill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserCppSkill_userId_skillId_key" ON "UserCppSkill"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCppFlashcard_userId_cardId_key" ON "UserCppFlashcard"("userId", "cardId");
