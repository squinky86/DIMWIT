import Alpine from '../vendor/alpine.js';
import { createToolkit } from './toolkit.js';

Alpine.data('toolkit', () => {
  const toolkit = createToolkit();
  const initialize = toolkit.init;
  toolkit.init = function () {
    initialize.call(this);
    document.getElementById('startup-notice').hidden = true;
  };
  return toolkit;
});
Alpine.start();
