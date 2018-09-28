jQuery(document).ready(function(){
    
    // запрет на перетаскивание QR-кода в Refill-balance
    setInterval(function(){    
        $('refill-balance .refill_processing_qr_code_wrap img').attr({
            "ondrag":"return false",
            "ondragdrop":"return false",
            "ondragstart":"return false"
        })
    }, 500);

    function scrollToDown(){
        var scrollToDown = $('pbx-chat .scrollToDown');
        scrollToDown.scrollTop(scrollToDown.prop('scrollHeight'));
    }
    // автоматическая прокрутка чата вниз при нажатии на 'chat'
    setInterval(function(){
        $('.header_button.chat').on('click', function(){
            scrollToDown();
        });
        // при добавлении нового сообщения автором
        $('pbx-chat input').keyup(function(e){
            if(e.keyCode == 13){
                setTimeout(function(){
                    scrollToDown();
                }, 500);
            }
        });
    }, 500);

    // IVR - horizontal scrollbar
    setInterval(function() {
        var el = document.querySelector('.ivr_create_body .left');
        var w1 = el.clientWidth;
        var w2 = el.scrollWidth;
        w2 > w1 ? $(el).addClass('h_scroll') : $(el).removeClass('h_scroll');
    }, 500);

});