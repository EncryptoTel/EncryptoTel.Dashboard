jQuery(document).ready(function(){
    
    var timeInterval = 800;
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
                  jQuery('.nicescroll-rails').remove();
                  doScrollbars();
              }
              start_url = curr_url;
          });

          jQuery()
    }

    function doScrollbars(){

      var idInterval2 = setInterval(function(){
        var height = jQuery('.custom-scrollbar').height();
        if(height > 0){
          jQuery('.custom-scrollbar').niceScroll({
            cursorcolor: "#57C6CB",
            cursorwidth: "2px",
            autohidemode: false,
            cursorborder: "0px solid transparent"
          });
          clearInterval(idInterval2);
        }
      }, timeInterval);

    }

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
        // alert('Hello Edge!');
        initScrollbar();
    }

    // firefox
    if (navigator.userAgent.search(/Firefox/) > 0){
        // alert('Hello Firefox!');
        initScrollbar();
    }

  });