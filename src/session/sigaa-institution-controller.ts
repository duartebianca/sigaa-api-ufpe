import { SigaaAccountIFSC } from '@account/sigaa-account-ifsc';
import { SigaaAccountUFPB } from '@account/sigaa-account-ufpb';
import { SigaaAccountUNB } from '@account/sigaa-account-unb';
import { SigaaLoginIFSC } from './login/sigaa-login-ifsc';
import { SigaaLoginUFPB } from './login/sigaa-login-ufpb';
import { SigaaLoginUNB } from './login/sigaa-login-unb';
import { SigaaPageIFSC } from './page/sigaa-page-ifsc';
import { SigaaPageUFPB } from './page/sigaa-page-ufpb';
import { SigaaPageUNB } from './page/sigaa-page-unb';
import { SigaaLoginUFPE } from './login/sigaa-login-ufpe';
import { SigaaPageUFPE } from './page/sigaa-page-ufpe';
import { SigaaAccountUFPE } from '@account/sigaa-account-ufpe';
/**
 * Map
 */
export type InstitutionType = 'IFSC' | 'UFPB' | 'UNB' | 'UFPE';
export type InstitutionMap<T> = Record<InstitutionType, T>;
/**
 * Map of classes that returns SigaaLogin instance;
 */
type SigaaLoginMap =
  | typeof SigaaLoginIFSC
  | typeof SigaaLoginUFPB
  | typeof SigaaLoginUNB
  | typeof SigaaLoginUFPE;
export type SigaaLoginInstitutionMap = InstitutionMap<SigaaLoginMap>;

/**
 * Map of classes that returns SigaaAccount instance;
 */
type SigaaAccountMap =
  | typeof SigaaAccountIFSC
  | typeof SigaaAccountUFPB
  | typeof SigaaAccountUNB
  | typeof SigaaAccountUFPE;
export type SigaaAccountInstitutionMap = InstitutionMap<SigaaAccountMap>;

/**
 * Map of classes that returns SigaaPage instance;
 */
type SigaaPageMap =
  | typeof SigaaPageIFSC
  | typeof SigaaPageUFPB
  | typeof SigaaPageUNB
  | typeof SigaaPageUFPE;
export type SigaaPageInstitutionMap = InstitutionMap<SigaaPageMap>;

export interface InstitutionController {
  institution: InstitutionType;
  url: URL;
}

export class SigaaInstitutionController implements InstitutionController {
  public institution: InstitutionType;
  public url: URL;
  constructor(institution: InstitutionType, url: string) {
    this.institution = institution;
    this.url = new URL(url);
  }
}
