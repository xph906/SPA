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
    $container.html(
      '<h1 style="display:inline-block; margin:25px;">' +
        'hello world' +
        '</h1>'
    );
  };

  return { initModule: initModule };
}());