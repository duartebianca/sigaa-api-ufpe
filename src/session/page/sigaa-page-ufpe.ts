import {
    CommonPage,
    SigaaForm,
    CommonSigaaPage,
    SigaaPageConstructor
  } from '@session/sigaa-page';
  import { URL } from 'url';
  
  /**
   * @category Internal
   */
  export interface UFPEPage extends CommonPage {
    /**
     * Extracts the javascript function JSFCLJS from the page,
     * this function on the page redirects the user to another
     * page using the POST method, often this function is in
     * the onclick attribute in some element.
     * @param javaScriptCode
     * @returns Object with URL action and POST values equivalent to function
     */
    parseJSFCLJS(javaScriptCode: string): SigaaForm;
  }
  
  /**
   * Response page of sigaa.
   * @category Internal
   */
  export class SigaaPageUFPE extends CommonSigaaPage {
    constructor(options: SigaaPageConstructor) {
      super(options);
    }
  
    /**
     * @inheritdoc
     */
    parseJSFCLJS(javaScriptCode: string): SigaaForm {
      if (!javaScriptCode.includes('getElementById'))
        throw new Error('SIGAA: Form not found.');
  
      const formQuery = javaScriptCode.match(
        /document\.getElementById\('(\w+)'\)/
      );
      if (!formQuery) throw new Error('SIGAA: Form without id.');
  
      const formEl = this.$(`#${formQuery[1]}`);
      if (!formEl) {
        throw new Error('SIGAA: Form not found.');
      }
  
      const formAction = formEl.attr('action');
      if (formAction === undefined)
        throw new Error('SIGAA: Form without action.');
  
      const action = new URL(formAction, this.url);
      const postValues: Record<string, string> = {};
  
      formEl.find("input:not([type='submit'])").each((_, element) => {
        const name = this.$(element).attr('name');
        const value = this.$(element).val();
        if (name !== undefined) {
          postValues[name] = value;
        }
      });
      const formPostValuesString = `{${javaScriptCode
        .replace(/if([\S\s]*?),{|},([\S\s]*?)false/gm, '')
        .replace(/"/gm, '\\"')
        .replace(/'/gm, '"')}}`;
      return {
        action,
        postValues: {
          ...postValues,
          ...JSON.parse(formPostValuesString)
        }
      };
    }
  }
  