import { App } from './ui/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    new App(rootElement);
  }
});
