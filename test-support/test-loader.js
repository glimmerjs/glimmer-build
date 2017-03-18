/* globals require */

QUnit.config.autostart = false;
QUnit.config.urlConfig.push({ id: 'nolint', label: 'Disable Linting' });

setTimeout(function() {
  require('tests');
  QUnit.start();
}, 250);
