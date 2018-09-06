jQuery(document).ready(function(){
    
    var timeInterval = 2000;
    var start_url;

    function initScrollbar(){

        var idInterval = setInterval(function(){
            var h = jQuery('main-view').height();
            if(h > 0){
              doScrollbars();
              start_url = document.location.href;
              clearInterval(idInterval);
            }
          }, timeInterval);
      
          jQuery('html').on('click', function(){
              var curr_url = document.location.href;
              if(start_url != curr_url){
                  jQuery('.nicescroll-rails.remove').remove();
                  doScrollbars();
              }
              start_url = curr_url;
          });
    }

    function doScrollbars(){

      var idInterval2 = setInterval(function(){
        var height = jQuery('main-view').height();
        if(height > 0){
          jQuery('.custom-scrollbar-const').niceScroll({
            cursorcolor: "#57C6CB",
            cursorwidth: "2px",
            autohidemode: false,
            cursorborder: "0px solid transparent"
          });
          jQuery('.nicescroll-rails:not(.remove)').addClass('not-remove');
          jQuery('.custom-scrollbar').niceScroll({
            cursorcolor: "#57C6CB",
            cursorwidth: "2px",
            autohidemode: false,
            cursorborder: "0px solid transparent"
          });
          jQuery('.nicescroll-rails:not(.not-remove)').addClass('remove');
          clearInterval(idInterval2);
        }
      }, timeInterval);

    }

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
        initScrollbar();
    }

    // firefox
    if (navigator.userAgent.search(/Firefox/) > 0){
        initScrollbar();
    }

  });