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
  ) { }

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

  async getFrontPageHomeworks() {
    const frontPage = await this.http.get('https://sig.ifsc.edu.br/sigaa/verPortalDiscente.do');
    const table = frontPage.$('#avaliacao-portal > table');
    if (table.length === 0) return [];
    const listCourses: CourseStudent[] = [];
    const rows = table.find('tbody > tr').toArray();
    const tableColumnIndexs: Record<string, null | number> = {
      date: null,
      homework: null,
      status: null
    };

    const tableHeaderCellElements = table.find('thead > tr td').toArray();
    for (let column = 0; column < tableHeaderCellElements.length; column++) {
      const cellContent = this.parser.removeTagsHtml(
        coursesPage.$(tableHeaderCellElements[column]).html()
      );
      console.log(cellContent)
      switch (cellContent) {
        case 'Data':
          tableColumnIndexs.date = column
          break;
        case 'Atividade':
          tableColumnIndexs.homework = column;
          break;
        case '':
          tableColumnIndexs.status = column;
          break;
      }
    }
    for (const row of rows) {
      const cellElements = frontPage.$(row).find('td');
      console.log(row);
    }
  }
}
