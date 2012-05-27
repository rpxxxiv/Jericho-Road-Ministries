


function SetLinkEvents(ullia, iframe) {

    $(ullia).find('a').each(
        function () {
            MapLinkEvent($(this), iframe);
        })
}


function MapLinkEvent(btn, iframe) {
    var $frm = iframe;
    var link = $(btn).attr('href');
    //link = link.substring(link.indexOf('#'));
    //$(btn).attr('href')
    var a = link;
    var expr = /http:|mailto:/;
    var isOutOfDomain = link.toString().search(expr);
    
    var inDomain = link.toString().search("Pages/");
    if (isOutOfDomain && inDomain) {
        a = NavUriMapper(link.replace('#', '').replace('.html', ''));
    }

    $(btn).click(function (e) {
        if (isOutOfDomain) {
            e.preventDefault();
            $frm.animate(
            { opacity: 0 },
            toggleSpeed,
                function () {
                    $frm.delay(300);                    
                    $frm.empty();
                    $frm.attr("src", a);

                });
        }
    });
}

function NavUriMapper(link) {

    return 'Pages/{0}.html'.format(link);
}

String.prototype.format = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};