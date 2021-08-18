import { Parser } from '@helpers/sigaa-parser';
import { HTTP } from '@session/sigaa-http';

import { UpdatableResourceCallback } from '@resources/updatable-resource';
import { News, NewsData, SigaaNews } from '@courseResources/sigaa-news-student';
import { Quiz, QuizData, SigaaQuiz } from '@attachments/sigaa-quiz-student';
import { FileData, SigaaFile, File } from '@resources/sigaa-file';

import {
  Lesson,
  LessonData,
  SigaaLesson
} from './resources/sigaa-lesson-student';

import {
  SigaaWebContent,
  WebContent,
  WebContentData
} from '@attachments/sigaa-web-content-student';

import {
  CourseForum,
  ForumData,
  SigaaCourseForum
} from '@courseResources/forum/sigaa-course-forum-student';

import {
  Homework,
  HomeworkData,
  SigaaHomework
} from '@attachments/sigaa-homework-student';
import {
  SigaaSurvey,
  Survey,
  SurveyData
} from '@attachments/sigaa-survey-student';
import { sharedReturn } from '@helpers/sigaa-shared-return-decorator-factory';

/**
 * Create instances of course resources.
 * @category Internal
 */
export interface CourseResourcesFactory {
  createWebContentFromWebContentData(
    options: WebContentData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): WebContent;

  createLessonFromLessonData(
    options: LessonData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): Lesson;

  createFileFromFileData(
    options: FileData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): File;

  createHomeworkFromHomeworkData(
    homeworkOptions: HomeworkData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): Homework;

  createForumFromForumData(
    options: ForumData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): CourseForum;

  createNewsFromNewsData(
    newsOptions: NewsData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): News;

  createQuizFromQuizData(
    quizData: QuizData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): Quiz;

  createSurveyFromSurveyData(
    surveyData: SurveyData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): Survey;
}

/**
 * Class to create instances of course resources.
 * @category Internal
 */
export class SigaaCourseResourcesFactory implements CourseResourcesFactory {
  constructor(private parser: Parser) {}

  @sharedReturn()
  createHomeworkFromHomeworkData(
    options: HomeworkData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaHomework {
    return new SigaaHomework(http, this, options, updateCallback);
  }

  @sharedReturn()
  createWebContentFromWebContentData(
    options: WebContentData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaWebContent {
    return new SigaaWebContent(http, this.parser, options, updateCallback);
  }

  createLessonFromLessonData(
    options: LessonData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaLesson {
    return new SigaaLesson(options, updateCallback);
  }

  @sharedReturn()
  createFileFromFileData(
    options: FileData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaFile {
    return new SigaaFile(http, options, updateCallback);
  }

  @sharedReturn()
  createForumFromForumData(
    options: ForumData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaCourseForum {
    return new SigaaCourseForum(
      http,
      this.parser,
      this,
      options,
      updateCallback
    );
  }

  @sharedReturn()
  createNewsFromNewsData(
    options: NewsData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaNews {
    return new SigaaNews(http, this.parser, options, updateCallback);
  }

  @sharedReturn()
  createQuizFromQuizData(
    options: QuizData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaQuiz {
    return new SigaaQuiz(http, options, updateCallback);
  }

  @sharedReturn()
  createSurveyFromSurveyData(
    options: SurveyData,
    http: HTTP,
    updateCallback: UpdatableResourceCallback
  ): SigaaSurvey {
    return new SigaaSurvey(options, updateCallback);
  }
}
