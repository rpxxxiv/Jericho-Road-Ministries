var toggleSpeed = 1000;
function NavMenuLoad(ul) {
    $(ul).each(
        function () {
            $(this).hover(
                function () {
                    $(this).find('ul').fadeIn(500);
                },
                function () {
                    $(this).find('ul').fadeOut(500);
                });
        })
}

function frameResize(iframe) {

    var frm = $(iframe).attr('id');
    var h = document.getElementById(frm).contentWindow.document.body.offsetHeight + 'px';
    document.getElementById(frm).style.height = h;
}

