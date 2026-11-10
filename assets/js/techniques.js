import { tagTechnique } from './tags.js';
import { directTechniques } from './direct.js';
import { unicodeTechniques } from './unicode.js';
import { encodingTechniques, evasionTechnique } from './encoding.js';
import { markupTechniques } from './markup.js';

export const methods = [tagTechnique, ...directTechniques, ...unicodeTechniques, ...encodingTechniques, evasionTechnique, ...markupTechniques];
