import { CourseFactory } from '@courses/sigaa-course-student-factory';
import { Parser } from '@helpers/sigaa-parser';
import { HTTP } from '@session/sigaa-http';

import {
  CourseStudent,
  CourseStudentData
} from '@courses/sigaa-course-student';

/**
 * Abstraction to represent a student bond.
 * @category Public
 */
export interface StudentBond {
  readonly type: 'student';
  /**
   * It's the name of the student program, in IFSC it is called "curso".
   */
  readonly program: string;
  /**
   * It is the student registration code, in IFSC it is called "matrícula".
   */
  readonly registration: string;
  /**
   * Get courses, in IFSC it is called "Turmas Virtuais".
   * @param allPeriods if true, all courses will be returned; otherwise, only current courses.
   * @returns Promise with array of courses.
   */
  getCourses(allPeriods?: boolean): Promise<CourseStudent[]>;

  getActivities(): Promise<Activity[]>;
}

export interface Activity {
  title: string;
  course: { title: string };
  date: Date;
  done: boolean;
}
/**
 * Class to represent student bond.
 * @category Internal
 */
export class SigaaStudentBond implements StudentBond {
  constructor(
    private http: HTTP,
    private parser: Parser,
    private courseFactory: CourseFactory,
    readonly program: string,
    readonly registration: string,
    readonly bondSwitchUrl: URL | null
  ) {}

  readonly type = 'student';

  /**
   * Get courses, in IFSC it is called "Turmas Virtuais".
   * @param allPeriods if true, all courses will be returned; otherwise, only latest courses.
   * @returns Promise with array of courses.
   */
  async getCourses(allPeriods = false): Promise<CourseStudent[]> {
    const coursesPage = await this.http.get(
      '/sigaa/portais/discente/turmas.jsf'
    );

    const table = coursesPage.$('.listagem');
    if (table.length === 0) return [];
    const listCourses: CourseStudent[] = [];
    const rows = table.find('tbody > tr').toArray();

    /* 
       If allPeriods is true then only the last period is
       returned, therefore we need to find out what the 
       value of the last period is, since different 
       versions of SIGAA can have different ordering we 
       can't get the last or first period in the table,
       we need to find out which is the newest regardless
       of table order.
    */
    let periodFilter: null | string = null;
    if (!allPeriods) {
      for (let i = 0; i < rows.length; i++) {
        const cellElements = coursesPage.$(rows[i]).find('td');
        if (cellElements.eq(0).hasClass('periodo')) {
          const currentPeriod = this.parser.removeTagsHtml(
            cellElements.eq(0).html()
          );
          if (periodFilter == null) {
            periodFilter = currentPeriod;
          } else if ([currentPeriod, periodFilter].sort()[1] == currentPeriod) {
            //Check alphabetically if the currentPeriod is the oldest
            periodFilter = currentPeriod;
          } else {
            //If the periodFilter is already the newest, we don't need to look for a newest one.
            break;
          }
        }
      }
    }

    const tableColumnIndexs: Record<string, null | number> = {
      title: null,
      class: null,
      schedule: null,
      numberOfStudents: null,
      button: null
    };

    const tableHeaderCellElements = table.find('thead > tr td').toArray();
    for (let column = 0; column < tableHeaderCellElements.length; column++) {
      const cellContent = this.parser.removeTagsHtml(
        coursesPage.$(tableHeaderCellElements[column]).html()
      );
      switch (cellContent) {
        case 'Disciplina':
          tableColumnIndexs.title = column;
          break;
        case 'Turma':
          tableColumnIndexs.class = column;
          break;
        case 'Horário':
          tableColumnIndexs.schedule = column;
          break;
        case 'Alunos':
          tableColumnIndexs.numberOfStudents = column;
          break;
        case '':
          tableColumnIndexs.button = column;
          break;
      }
    }

    if (tableColumnIndexs.button == null) {
      throw new Error(
        'SIGAA: Invalid courses table, could not find the column with class buttons.'
      );
    }
    if (tableColumnIndexs.title == null) {
      throw new Error(
        'SIGAA: Invalid courses table, could not find the column with class titles.'
      );
    }
    if (tableColumnIndexs.schedule == null) {
      throw new Error(
        'SIGAA: Invalid courses table, could not find the column with class schedules.'
      );
    }
    let period;

    for (const row of rows) {
      const cellElements = coursesPage.$(row).find('td');
      if (cellElements.eq(0).hasClass('periodo')) {
        period = this.parser.removeTagsHtml(cellElements.html());
      } else if (period && (!periodFilter || periodFilter == period)) {
        const fullname = this.parser.removeTagsHtml(
          cellElements.eq(tableColumnIndexs.title).html()
        );

        const [title, code] = fullname.split(' - ');

        const buttonCoursePage = cellElements
          .eq(tableColumnIndexs.button)
          .find('a[onclick]');

        const buttonOnClickCode = buttonCoursePage.attr('onclick');

        if (!buttonOnClickCode)
          throw new Error('SIGAA: Courses table without course button.');

        const form = coursesPage.parseJSFCLJS(buttonOnClickCode);

        let numberOfStudents = 0;
        if (tableColumnIndexs.numberOfStudents !== null) {
          numberOfStudents = Number(
            this.parser.removeTagsHtml(
              cellElements.eq(tableColumnIndexs.numberOfStudents).html()
            )
          );
        }

        const schedule = this.parser.removeTagsHtml(
          cellElements.eq(tableColumnIndexs.schedule).html()
        );

        const id = form.postValues['idTurma'];

        if (!id) throw new Error('SIGAA: Course ID not found.');
        const courseData: CourseStudentData = {
          title,
          code,
          schedule,
          numberOfStudents,
          period,
          id,
          form
        };
        listCourses.push(this.courseFactory.createCourseStudent(courseData));
      }
    }
    return listCourses;
  }

  async getActivities(): Promise<Activity[]> {
    const frontPage = await this.http.get(
      '/sigaa/portais/discente/discente.jsf'
    );
    const table = frontPage.$('#avaliacao-portal > table');
    const rows = table.find('tbody > tr');
    const listActivities: Activity[] = [];
    for (const row of rows) {
      const cellElements = frontPage.$(row).find('td');
      const fullText = this.parser.removeTagsHtml(cellElements.html());
      
      const regex = /(\d{2}\/\d{2}\/\d{4})/g;
      const matchesDate = regex.exec(fullText);
      if (matchesDate) {
        // regex para separar horario no padrão do sigaa dd/mm/yyyyHH:MM
        const horario = fullText.trim().split(/(\d{2}\/\d{2}\/\d{4})/g)[2];
        const regexHorario = /(\d{2}:\d{2})/g;
        const matchesHorario = regexHorario.exec(horario);
        // caso o matchesHorario não funcionar, ele coloca horario padrão
        let hora = '23';
        let minuto = '59';
        if (matchesHorario) {
          hora = matchesHorario[1].split(':')[0];
          minuto = matchesHorario[1].split(':')[1];
        }
        const [dia, mes, ano] = matchesDate[1].split('/');
        const dateObject = new Date(
          `${parseInt(mes)}/${parseInt(dia)}/${parseInt(ano)} ${parseInt(
            hora
          )}:${parseInt(minuto)}`
        );
        const isDone =
          cellElements.find('img').attr('src') === '/sigaa/img/check.png';

        const infoText = this.parser.removeTagsHtml(
          cellElements.find('small').html()
        );
        const isHomework = infoText
          .replace(/(\r\n|\n|\r|\t)/gm, '')
          .split(' Tarefa:');
        const isExam = infoText
          .replace(/(\r\n|\n|\r|\t)/gm, '')
          .split(' Avaliação: ');
        const isQuiz = infoText
          .replace(/(\r\n|\n|\r|\t)/gm, '')
          .split(' Questionário:');
        const [courseName, activityName] =
          isHomework.length > 1
            ? isHomework
            : isExam.length > 1
            ? isExam
            : isQuiz.length > 1
            ? isQuiz
            : [];
        listActivities.push({
          title: activityName,
          course: { title: courseName },
          date: dateObject,
          done: isDone
        });
      }
    }
    return listActivities;
  }
}
