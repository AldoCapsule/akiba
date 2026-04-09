import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class EducationService {
  private readonly logger = new Logger(EducationService.name);

  constructor(private readonly db: DatabaseService) {}

  async getPaths(_userId: string | undefined, _language?: string) {
    const where: any = { isActive: true };

    const paths = await this.db.learningPath.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { lessons: true } },
      },
    });

    // TODO: If userId, fetch user progress for each path

    return paths.map((p) => ({
      id: p.id,
      title: p.titleFr,
      titleFr: p.titleFr,
      titleWo: p.titleWo,
      titleEn: p.titleEn,
      description: p.description,
      slug: p.slug,
      lessonCount: p._count.lessons,
      completedLessons: 0, // TODO: Compute from user progress
      progressPercent: 0,
      iconUrl: p.iconUrl,
      unlocksFeature: p.unlocksFeature,
    }));
  }

  async getPath(_userId: string | undefined, pathId: string): Promise<any> {
    const path = await this.db.learningPath.findUnique({
      where: { id: pathId },
    });

    if (!path) {
      throw new NotFoundException('Learning path not found');
    }

    const lessons = await this.db.lesson.findMany({
      where: { learningPathId: pathId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        titleFr: true,
        titleWo: true,
        titleEn: true,
        slug: true,
        sortOrder: true,
        quizQuestions: true,
      },
    });

    // TODO: If userId, mark which lessons are completed

    return {
      ...path,
      lessons: lessons.map((l) => ({
        ...l,
        hasQuiz: l.quizQuestions != null,
        isCompleted: false, // TODO: Check user progress
        quizScore: null, // TODO: Fetch user quiz result
      })),
    };
  }

  async getLesson(_userId: string | undefined, pathId: string, lessonId: string): Promise<any> {
    const lesson = await this.db.lesson.findFirst({
      where: { id: lessonId, learningPathId: pathId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async completeLesson(userId: string, pathId: string, lessonId: string) {
    const lesson = await this.db.lesson.findFirst({
      where: { id: lessonId, learningPathId: pathId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // TODO: Check if already completed (idempotent)
    // TODO: Award XP
    // TODO: Check if badge criteria met
    // TODO: Update streak

    const progress = await this.db.learningProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} completed lesson ${lessonId}`);

    // TODO: Check for newly earned badges

    return {
      lessonId,
      isCompleted: progress.isCompleted,
      message: 'Lesson completed!',
      newBadges: [], // TODO: Populate if badge criteria met
    };
  }

  async submitQuiz(
    userId: string,
    _pathId: string,
    lessonId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const lesson = await this.db.lesson.findFirst({
      where: { id: lessonId },
    });

    if (!lesson || !lesson.quizQuestions) {
      throw new NotFoundException('No quiz found for this lesson');
    }

    // quizQuestions is a JSON field: array of { question, options, correctIndex }
    const questions = lesson.quizQuestions as any[];

    let correct = 0;
    const results = answers.map((a: { questionId: string; answer: string }) => {
      const question = questions.find((q: any) => q.id === a.questionId);
      const isCorrect = question?.correctAnswer === a.answer;
      if (isCorrect) correct++;
      return {
        questionId: a.questionId,
        isCorrect,
        correctAnswer: question?.correctAnswer,
      };
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= 70;

    // Store quiz result as learning progress
    await this.db.learningProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        quizScore: score,
        completedAt: new Date(),
      },
      update: {
        quizScore: score,
        completedAt: new Date(),
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
    const [completedLessons, quizResults] = await Promise.all([
      this.db.learningProgress.count({ where: { userId, isCompleted: true } }),
      this.db.learningProgress.count({ where: { userId, quizScore: { gte: 70 } } }),
    ]);

    // TODO: Calculate streak from consecutive daily completions
    // TODO: Compute level progression percentage

    return {
      completedLessons,
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
      name: b.nameFr,
      nameFr: b.nameFr,
      nameWo: b.nameWo,
      nameEn: b.nameEn,
      description: b.description,
      iconUrl: b.iconUrl,
      earnedAt: b.userBadges[0]?.earnedAt,
    }));
  }

  async getLeaderboard(_period: string) {
    // TODO: Filter by period (week, month, all-time)
    // TODO: Use materialized view or cache for performance

    const leaderboard = await this.db.learningProgress.groupBy({
      by: ['userId'],
      where: { isCompleted: true },
      _count: { lessonId: true },
      orderBy: { _count: { lessonId: 'desc' } },
      take: 50,
    });

    // TODO: Enrich with user names (consider privacy - use display names)

    return {
      period: _period,
      data: leaderboard.map((entry: any, index: number) => ({
        rank: index + 1,
        userId: entry.userId,
        completedLessons: entry._count.lessonId || 0,
        displayName: 'Anonymous', // TODO: Fetch user display name
      })),
    };
  }
}
