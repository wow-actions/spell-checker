import * as alex from './alex';
import * as writeGood from './writegood';
import * as spellCheck from './spellcheck';
import { Results } from './types';
export { alex, writeGood as writegood, spellCheck as spellcheck };
export declare function check(content: string): Results;
