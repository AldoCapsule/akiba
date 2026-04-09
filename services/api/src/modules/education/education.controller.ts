import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { EducationService } from './education.service';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get('paths')
  @ApiOperation({
    summary: 'List learning paths',
    description:
      'Returns available financial literacy learning paths with progress for authenticated users.',
  })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language (fr, en, wo)' })
  @ApiOkResponse({ description: 'Learning paths returned' })
  async getPaths(@Request() req: any, @Query('language') language?: string) {
    return this.educationService.getPaths(req.user?.id, language);
  }

  @Get('paths/:pathId')
  @ApiOperation({
    summary: 'Get learning path details',
    description: 'Returns a specific learning path with its lessons and user progress.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path UUID' })
  @ApiOkResponse({ description: 'Path details returned' })
  @ApiNotFoundResponse({ description: 'Path not found' })
  async getPath(@Request() req: any, @Param('pathId') pathId: string) {
    return this.educationService.getPath(req.user?.id, pathId);
  }

  @Get('paths/:pathId/lessons/:lessonId')
  @ApiOperation({
    summary: 'Get lesson content',
    description: 'Returns the full lesson content including text, images, and interactive elements.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path UUID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiOkResponse({ description: 'Lesson content returned' })
  async getLesson(
    @Request() req: any,
    @Param('pathId') pathId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.educationService.getLesson(req.user?.id, pathId, lessonId);
  }

  @Post('paths/:pathId/lessons/:lessonId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark lesson as completed',
    description: 'Records that the authenticated user has completed a specific lesson.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path UUID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiOkResponse({ description: 'Lesson marked as completed, XP awarded' })
  async completeLesson(
    @Request() req: any,
    @Param('pathId') pathId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.educationService.completeLesson(req.user?.id, pathId, lessonId);
  }

  @Post('paths/:pathId/lessons/:lessonId/quiz')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit quiz answers',
    description: 'Submits quiz answers for a lesson. Returns score and correct answers.',
  })
  @ApiParam({ name: 'pathId', description: 'Learning path UUID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiOkResponse({ description: 'Quiz graded and results returned' })
  async submitQuiz(
    @Request() req: any,
    @Param('pathId') pathId: string,
    @Param('lessonId') lessonId: string,
    @Body() answers: { questionId: string; answer: string }[],
  ) {
    return this.educationService.submitQuiz(req.user?.id, pathId, lessonId, answers);
  }

  @Get('progress')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get overall learning progress',
    description: 'Returns the user overall learning stats: completed lessons, XP, streak, level.',
  })
  @ApiOkResponse({ description: 'Progress data returned' })
  async getProgress(@Request() req: any) {
    return this.educationService.getProgress(req.user?.id);
  }

  @Get('badges')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get earned badges',
    description: 'Returns all badges earned by the user through completing lessons and quizzes.',
  })
  @ApiOkResponse({ description: 'Badges returned' })
  async getBadges(@Request() req: any) {
    return this.educationService.getBadges(req.user?.id);
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Get learning leaderboard',
    description: 'Returns the top learners by XP for gamification.',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'all'], description: 'Leaderboard time period' })
  @ApiOkResponse({ description: 'Leaderboard returned' })
  async getLeaderboard(@Query('period') period = 'week') {
    return this.educationService.getLeaderboard(period);
  }
}
