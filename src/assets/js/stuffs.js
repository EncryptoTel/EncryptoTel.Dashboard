jQuery(document).ready(function(){
    
    // запрет на перетаскивание QR-кода в Refill-balance
    setInterval(function(){    
        $('refill-balance .refill_processing_qr_code_wrap img').attr({
            "ondrag":"return false",
            "ondragdrop":"return false",
            "ondragstart":"return false"
        })
    }, 500);

});