jQuery(document).ready(function(){

    var time = 2000;
    var miniTime = 1000;

    setInterval(function(){
        checkingSidebar();
    }, miniTime);
       
    function checkingSidebar(){
        var intervalTime = setInterval(function(){
            var sidebarHeight = jQuery('pbx-address-book pbx-sidebar .side_body').height();
            if(sidebarHeight > 0){
                clearInterval(intervalTime);
                correctErrorPosition();
            }else{
                clearInterval(intervalTime);
                checkingSidebar();
            }

        }, miniTime);
   }

    function correctErrorPosition(){
        jQuery('pbx-address-book pbx-sidebar .side_body').on('scroll', function(){
            jQuery('pbx-address-book pbx-sidebar .pbx_input_error_float')
            .removeClass('pbx_input_error_float')
            .addClass('pbx_input_error_float_focus')
            .css({'opacity': 0});

            sideBarMath();

            jQuery('pbx-address-book pbx-sidebar .pbx_input_error_float_focus:not(:eq(0))')
            .removeClass('pbx_input_error_float_focus')
            .addClass('pbx_input_error_float')
            .css({'opacity': 1});

        });
    };

    function sideBarMath(){
        var blocks = jQuery('pbx-address-book pbx-sidebar .side_body .pbx_input_row');
        for(var i = 0; i < blocks.length; i++){
            var curr = blocks[i];
            var pos = jQuery(curr).offset().top;
            var err = jQuery(curr).find('.pbx_input_error_float_focus');
            var margin = jQuery(err).css('marginTop');
            if(typeof margin === 'string'){
                parts = margin.split('px');
                margin = parts[0] * 1;
            }else{
                margin = 0;
            }
            var maxTop = jQuery('pbx-address-book pbx-sidebar').offset().top;
            if( (pos - margin) < maxTop ){
                jQuery(err).css({'opacity': 0});
            }else{
                jQuery(err).offset({top: pos + margin});
                jQuery(err).css({'opacity': 1});
            }

        }
    }

    //----------------------------------------
    // меню

    $('.user_btn').on('click', function () {
       $('.mobile_menu').addClass('mobile_menu--active');
       $('.mobile_overlay').addClass('mobile_overlay--active');
    });
    $('.mobile_overlay').on('click', function () {
        $('.mobile_menu').removeClass('mobile_menu--active');
        $(this).removeClass('mobile_overlay--active');
    });

    // ---------------------------------
    // открытие карточки и поворот кнопки

    $('.mobile_item_card').on('click', function () {
        $(this).find('.dropdown_arrow_btn').toggleClass('rotate180');
        $(this).find('.mobile_item_card_comment').toggleClass('mobile_item_card_comment--active');
    });

    // ---------------------------------
    // transfer to acc


    // ---------------------------------
    // табы

    $('.user_mobile_tab__item').on('click', function () {
        $(this).addClass('user_mobile_tab__item--active').siblings().removeClass('user_mobile_tab__item--active');
        $('.mobile_block').addClass('mobile_block--dn').eq($(this).index()).removeClass('mobile_block--dn');
        return false;
    });




  });