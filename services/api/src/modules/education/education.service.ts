import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class EducationService {
  private readonly logger = new Logger(EducationService.name);

  constructor(private readonly db: DatabaseService) {}

  async getPaths(userId: string | undefined, language?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (language) where.language = language;

    const paths = await this.db.learningPath.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lessons: true } },
      },
    });

    // TODO: If userId, fetch user progress for each path

    return paths.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      language: p.language,
      difficulty: p.difficulty,
      lessonCount: p._count.lessons,
      estimatedMinutes: p.estimatedMinutes,
      completedLessons: 0, // TODO: Compute from user progress
      progressPercent: 0,
      imageUrl: p.imageUrl,
    }));
  }

  async getPath(userId: string | undefined, pathId: string) {
    const path = await this.db.learningPath.findUnique({
      where: { id: pathId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            durationMinutes: true,
            hasQuiz: true,
            xpReward: true,
          },
        },
      },
    });

    if (!path) {
      throw new NotFoundException('Learning path not found');
    }

    // TODO: If userId, mark which lessons are completed

    return {
      ...path,
      lessons: path.lessons.map((l) => ({
        ...l,
        isCompleted: false, // TODO: Check user progress
        quizScore: null, // TODO: Fetch user quiz result
      })),
    };
  }

  async getLesson(userId: string | undefined, pathId: string, lessonId: string) {
    const lesson = await this.db.lesson.findFirst({
      where: { id: lessonId, pathId },
      include: {
        quizQuestions: {
          select: {
            id: true,
            question: true,
            options: true,
            // Do NOT include correctAnswer here to prevent cheating
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async completeLesson(userId: string, pathId: string, lessonId: string) {
    const lesson = await this.db.lesson.findFirst({
      where: { id: lessonId, pathId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // TODO: Check if already completed (idempotent)
    // TODO: Award XP
    // TODO: Check if badge criteria met
    // TODO: Update streak

    const progress = await this.db.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        pathId,
        completedAt: new Date(),
        xpEarned: lesson.xpReward || 10,
      },
      update: {
        completedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} completed lesson ${lessonId}`);

    // TODO: Check for newly earned badges

    return {
      lessonId,
      xpEarned: progress.xpEarned,
      message: `Lesson completed! You earned ${progress.xpEarned} XP.`,
      newBadges: [], // TODO: Populate if badge criteria met
    };
  }

  async submitQuiz(
    userId: string,
    pathId: string,
    lessonId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const questions = await this.db.quizQuestion.findMany({
      where: { lessonId },
    });

    if (questions.length === 0) {
      throw new NotFoundException('No quiz found for this lesson');
    }

    let correct = 0;
    const results = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question?.correctAnswer === a.answer;
      if (isCorrect) correct++;
      return {
        questionId: a.questionId,
        isCorrect,
        correctAnswer: question?.correctAnswer,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    // TODO: Store quiz result
    // TODO: Award bonus XP for passing
    // TODO: Check for quiz-related badges

    await this.db.quizResult.create({
      data: {
        userId,
        lessonId,
        score,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    const bonusXp = passed ? 25 : 5;

    this.logger.log(`User ${userId} scored ${score}% on quiz for lesson ${lessonId}`);

    return {
      score,
      passed,
      correct,
      total: questions.length,
      xpEarned: bonusXp,
      results,
      message: passed
        ? `Great job! You scored ${score}% and earned ${bonusXp} bonus XP!`
        : `You scored ${score}%. You need 70% to pass. Try again!`,
    };
  }

  async getProgress(userId: string) {
    const [completedLessons, totalXp, quizResults] = await Promise.all([
      this.db.lessonProgress.count({ where: { userId } }),
      this.db.lessonProgress.aggregate({
        where: { userId },
        _sum: { xpEarned: true },
      }),
      this.db.quizResult.count({ where: { userId, passed: true } }),
    ]);

    const xp = totalXp._sum.xpEarned || 0;
    const level = Math.floor(xp / 100) + 1;

    // TODO: Calculate streak from consecutive daily completions
    // TODO: Compute level progression percentage

    return {
      completedLessons,
      totalXp: xp,
      level,
      xpToNextLevel: level * 100 - xp,
      quizzesPassed: quizResults,
      streak: 0, // TODO: Calculate
      badges: [], // TODO: Fetch from badges table
    };
  }

  async getBadges(userId: string) {
    const badges = await this.db.badge.findMany({
      where: {
        userBadges: { some: { userId } },
      },
      include: {
        userBadges: {
          where: { userId },
          select: { earnedAt: true },
        },
      },
    });

    return badges.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      imageUrl: b.imageUrl,
      earnedAt: b.userBadges[0]?.earnedAt,
    }));
  }

  async getLeaderboard(period: string) {
    // TODO: Filter by period (week, month, all-time)
    // TODO: Use materialized view or cache for performance

    const leaderboard = await this.db.lessonProgress.groupBy({
      by: ['userId'],
      _sum: { xpEarned: true },
      orderBy: { _sum: { xpEarned: 'desc' } },
      take: 50,
    });

    // TODO: Enrich with user names (consider privacy - use display names)

    return {
      period,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        totalXp: entry._sum.xpEarned || 0,
        displayName: 'Anonymous', // TODO: Fetch user display name
      })),
    };
  }
}
