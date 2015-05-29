/*
 * spa.shell.js
 * Shell module for SPA
*/

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
/*global $, spa */

spa.shell = (function () {
  //----------------------BEGIN MODULE SCOPE VARIABLES ------------------------
  var
    configMap = {
      main_html : String()
        + '<div class="spa-shell-head">'
          + '<div class="spa-shell-head-logo"></div>'
          + '<div class="spa-shell-head-acct"></div>'
          + '<div class="spa-shell-head-search"></div>'
        + '</div>'
        + '<div class="spa-shell-main">'
          + '<div class="spa-shell-main-nav"></div>'
          + '<div class="spa-shell-main-content"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-chat"></div>'
        + '<div class="spa-shell-modal"></div>',
      chat_extend_time : 1000,
      chat_retract_time : 300,
      chat_extend_height : 450,
      chat_retract_height : 15,
      chat_extended_title : 'Click to retract',
      chat_retracted_title : 'Click to extend',
      anchor_schema_map : {
        chat : {open : true, closed : true}
      }
    },
    stateMap = {
      $container : null,
      is_chat_retracted : true,
      anchor_map : {}
    },
    jqueryMap = {},
    copyAnchorMap, setJqueryMap, toggleChat,
    changeAnchorPart, onHashchange,
    onClickChat, initModule;
  //-----------------------END MODULE SCOPE VARIABLES -------------------------

  //------------------------BEGIN UTILITY METHODS ------------------------
  copyAnchorMap = function () {
    return $.extend(true, {}, stateMap.anchor_map);
  };
  //------------------------END UTILITY METHODS --------------------------

  //------------------------BEGIN DOM METHODS ------------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container,
      $chat : $container.find('.spa-shell-chat')
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /toggleChat/
  // Purpose: Extends or retracts chat slider
  // Arguments:
  //    * do_extend - if true, extends slider;
  //                  if false, retract;
  //    * callback - optional function to execute at
  //                  end of animation
  // State: Sets stateMap.is_chat_retracted
  //    * true - slider is retracted
  //    * false - slider is extended
  // Settings:
  //    * chat_extend_time, chat_retract_time
  //    * chat_extend_height, chat_retract_height
  // Returns:
  //    * true - slider animation activated
  //    * false - slider animation not activated
  toggleChat = function (do_extend, callback) {
    var px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_sliding = !is_open && !is_closed;

    // Avoid race conditioning
    if (is_sliding) { return false; }

    // Begin extend char slider
    if (do_extend) {
      jqueryMap.$chat.animate(
        {height : configMap.chat_extend_height},
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr(
            'title',
            configMap.chat_extended_title
          );
          stateMap.is_chat_retracted = false;
          if (callback) {
            callback(jqueryMap.$chat);
          }
        }
      );
      return true;
    }
    // End extend chat slider

    // Begin retract chat slider
    jqueryMap.$chat.animate(
      {height : configMap.chat_retract_height},
      configMap.chat_retract_time,
      function () {
        jqueryMap.$chat.attr(
          'title',
          configMap.chat_retracted_title
        );
        stateMap.is_chat_retracted = true;
        if (callback) {
          callback(jqueryMap.$chat);
        }
      }
    );
    return true;
    // End retract chat slider
  };

  // Begin DOM method /changeAnchorPart/
  // Purpose: Changes part of the URI anchor component
  // Arguments:
  //    * arg_map - the map describing what part of the URI anchor 
  //                we want to change      
  // Returns: boolean
  //    * true - anchor component was updated
  //    * false - anchor component was NOT updated
  // Actions:
  //    The current anchor was stored in stateMap.anchor_map
  //    See uriAnchor for a discussion of encoding
  //    The function only change exsiting value, not inserting new one
  //    This method
  //      * creates a copy of original anchor map
  //      * enumerates items in arg_map and updates the copy of anchor map
  //      * attempts to change the URI using uriAnchor
  //      * returns true on success, false on failure
  changeAnchorPart = function (arg_map) {
    var anchor_map_revise = copyAnchorMap(),
      key_name,
      key_name_dep;

    //begin merge changes into anchor map
    //note that here I changed the sample codes:
    //  instead of using continue label, I used continue
    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        //skip dependent keys (see uriAnchor for details)
        if (key_name.indexOf('_') === 0) { continue; }

        //update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        //update matching dependent key
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
          anchor_map_revise = arg_map[key_name_dep];
        } else {
          //updated value doesn't have dependent key/value pair
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    //begin attempt to update URI
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      console.log("error changeAnchorPart: failed to update anchor "
        + anchor_map_revise);
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      return false;
    }

    return true;
  };

  //------------------------END DOM METHODS --------------------------

  //------------------------BEGIN EVENT HANDLERS ------------------------
  // Begin Event Handler /onClickChat/
  // Purpose: Handlers the onClickChat event of chat element
  // Arguments:
  //    * event - jQuery event object
  // Returns: false
  // Action:
  //    * Toggle chat panel 
  onClickChat = function (event) {
    changeAnchorPart({
      chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
    });
    return false;
  };
  // End Event Handler /onClickChat/  

  // Begin Event Handler /onHashchange/
  // Purpose: Handlers the hashchange event
  // Arguments:
  //    * event - jQuery event object
  // Returns: false
  // Action:
  //    * Adjust the application only where new state differs 
  //    *   from existing one
  onHashchange = function (event) {
    var anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous,
      _s_chat_proposed,
      s_chat_proposed;

    //FIXME: if hash changes when sliding, it
    //doesn't work as expected.
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      console.log("error onHashchange: failed to make anchor map "
        + error);
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      anchor_map_proposed = anchor_map_previous;
    }
    stateMap.anchor_map = anchor_map_proposed;

    //update chat state
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;
    if (_s_chat_previous !== _s_chat_proposed) {
      if (_s_chat_proposed === "undefined") { 
        toggleChat(false);
      } else {
        s_chat_proposed = anchor_map_proposed.chat;
        switch (s_chat_proposed) {
          case 'open':
            toggleChat(true);
            break;
          case 'closed':
            toggleChat(false);
            break;
          default:
            toggleChat(false);
            delete anchor_map_proposed.chat;
            $.uriAnchor.setAnchor(anchor_map_proposed,null,true);  
            stateMap.anchor_map = anchor_map_proposed; 
        }
      }
    }
    
    //new state updates here ...

    return false;
  }

  // End Event Handler /onHashchange/
  //------------------------END EVENT HANDLERS --------------------------
 
  //------------------------BEGIN PUBLIC METHODS ------------------------
  // Begin Public method /initModule/
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    // Initialize chat slider and bind click handler
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr('title', configMap.chat_retracted_title)
      .click(onClickChat);

    //configure uriAnchor
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    $(window)
      .on('hashchange',onHashchange)
      .trigger('hashchange');
  };
  // End public method /initModule/

  return { initModule : initModule };
  //------------------------END PUBLIC METHODS --------------------------  
}());
