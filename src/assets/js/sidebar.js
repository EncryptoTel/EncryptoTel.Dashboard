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
    $('.mobile_item_card').on('click', '.dropdown_arrow_btn', function () {
        $(this).toggleClass('rotate180');
        // $(this).parent().find('.mobile_item_card_comment').toggleClass('mobile_item_card_comment--active');
        $(this).parent().find('.mobile_item_card_comment').toggleClass('mobile_item_card_comment--active');
    });

    // ---------------------------------
    // кнопка очистки поля
    var
        $parentBlock = $('.mobile_block');
    // отоброжение и скрытие кнопки очистки поля ввода, очистка
    $parentBlock.on('focus', '.mobile_input_item__input', showBtnReset);
    function showBtnReset () {
            $(this).siblings('.mobile_input_item__close').fadeIn(100);
        }

    $parentBlock.on('blur', '.mobile_input_item__input', hideBtnReset);
    function hideBtnReset() {
            $('.mobile_input_item__close').fadeOut(100);
        };

    $parentBlock.on('click', '.mobile_input_item__close', function(e){
            e.preventDefault();
            $(this).siblings(('.mobile_input_item__input')).val('');
        });

    // создание нового блока
    $parentBlock.on('click', '.btn_add', function(){
        $(this).css('display', 'none');
        $(this).siblings('.btn_remove').css('display', 'block');
        // // создаем блок элементов
        // // обертка
        // var $newInputWrapper = $('<div>').addClass('mobile_input_wrapper');
        // // блок с input'ом
        // var $newInputItem = $('<div>').addClass('mobile_input_item')
        //                               .addClass('mobile_input_item--w540')
        //                               .addClass('mobile_input_item--r19')
        //                               .addClass('mobile_input_item--mb20');
        // // btnAdd и btnRemove
        // var $newBtnAdd = $('<div>').addClass('btn_add');
        // var $newBtnRemove = $('<div>').addClass('btn_remove');
        // // input
        // $('<input>').addClass('mobile_input_item__input')
        //             .attr('type', 'text')
        //             .attr('placeholder', 'Phone Number')
        //             .attr('value', '')
        //             .appendTo($newInputItem);
        // $('<label>').addClass('mobile_input_item__label')
        //             .attr('value', 'Phone Number')
        //             .appendTo($newInputItem);
        // // btn_reset
        // var $btnReset = $('<button>').addClass('mobile_input_item__close')
        //                             .addClass('mobile_input_item__close--right0')
        //                             .appendTo($newInputItem);
        // // svg
        // $('<svg-icon>').addClass('svg')
        //                .attr('src', '../../assets/icons/_middle/cancel_delete_12px.svg')
        //                .appendTo($btnReset);
        //
        // $newInputWrapper.append($newInputItem);
        // $newInputWrapper.append($newBtnAdd);
        // $newInputWrapper.append($newBtnRemove);
        // $('.phone_wrapper').append($newInputWrapper);
    });
    // удаляем элемент
    $parentBlock.on('click', '.btn_remove', function() {
        var deleteElem = $(this).parent('.mobile_input_wrapper');
        deleteElem.remove();
    });

    // delete_window
    $('.btn_item_wide_block__btn.delete').on('click', openDeleteWindow);
    $('.mobile_storage_btn_delete').on('click', openDeleteWindow);

    function openDeleteWindow(e) {
        e.preventDefault();
        $('.delete_window').addClass('delete_window--active');
    }

    $('.delete_window_block__cancel').on('click', closeDeleteWindow);
    $('.delete_window .close').on('click', closeDeleteWindow);

    function closeDeleteWindow(e){
        e.preventDefault();
        $('.delete_window').removeClass('delete_window--active');
    }
    //---------------------------------
    $('.mobile_down_btn_block__btn--transfer_click').on('click', function (e) {
        e.preventDefault();
        $('.transfer_block').addClass('transfer_block--active');
    });

    $('.transfer_window_btn__item--cancel').on('click', function (e) {
        e.preventDefault();
        $('.transfer_block').removeClass('transfer_block--active');
    });


    // ---------------------------------
    // табы

    $('.user_mobile_tab__item').on('click', function () {
        $(this).addClass('user_mobile_tab__item--active').siblings().removeClass('user_mobile_tab__item--active');
        $('.mobile_block').addClass('mobile_block--dn').eq($(this).index()).removeClass('mobile_block--dn');
        return false;
    });

    // карточка переключения темы
    $('.mobile_settings_min').on('click', function () {
        $(this).addClass('mobile_settings_min--active').siblings().removeClass('mobile_settings_min--active');
    });



    // $(".mobile_photo_file_upload__file").on('change', function(){
    //      var filename = $(this).val().replace(/.*\\/, "");
    //      $("#filename").val(filename);
    // });


  });

jQuery(document).ready(function () {
    // ---------------------------------
    //DETAILS AND RECORDS
    $('.mobile_status_inform__btn').on('click', function (e) {
        e.preventDefault();

        var
            activeColor = $(this).attr('data-color'),
            status = $('.mobile_item_card__status'),
            elemName  = $(this).text().toLowerCase();

        $(this).toggleClass('mobile_status_inform__btn--active');

        if($(this).hasClass('mobile_status_inform__btn--active')){
            $(this).css('background', activeColor);
            setColorStatus();
        } else {
            $(this).css('background', 'transparent');
            resetColorStatus();
        }

        function setColorStatus() {
            status.each(function () {
                if($(this).text().toLowerCase() == elemName){
                    $(this).css('color', activeColor);
                }
            });
        }

        function resetColorStatus() {
            status.each(function () {
                if($(this).text().toLowerCase() == elemName){
                    $(this).css('color', 'inherit');
                }
            });
        }

    });

});
