jQuery(document).ready(function(){
    
    // запрет на перетаскивание QR-кода в Refill-balance
    setInterval(function(){    
        $('refill-balance .refill_processing_qr_code_wrap img').attr({
            "ondrag":"return false",
            "ondragdrop":"return false",
            "ondragstart":"return false"
        })
    }, 500);

    // автоматическая прокрутка чата вниз при нажатии на 'chat'
    function scrollToDown(){
        var scrollToDown = $('pbx-chat .scrollToDown');
        scrollToDown.scrollTop(scrollToDown.prop('scrollHeight'));
    }
    setInterval(function(){
        $('.header_button.chat').on('click', function(){
            scrollToDown();
        });
        $('pbx-chat input').keyup(function(e){
            if(e.keyCode == 13){
                setTimeout(function(){
                    scrollToDown();
                }, 500);
            }
        });
    }, 500);

});