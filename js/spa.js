/*jslint
  devel : true,
  continue : true,
  maxerr : 50,
  plusplus : true,
  vars : false,
  newcap : true,
  regexp : true,
  browser : true,
  indent : 2,
  nomen : true,
  sloppy : true
*/
/*global spa */

var spa = (function () {
  var initModule = function ($container) {
    spa.shell.initModule($container);
  };

  return { initModule: initModule };
}());