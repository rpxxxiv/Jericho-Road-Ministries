
$(document).ready(
            function () {
            $('a').each(
                    function () { MapLinkEvent($(this), $(window.parent.document).find('#frm1')); });
            })