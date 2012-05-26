var fc = $.fullCalendar;
var formatDate = fc.formatDate;
var parseISO8601 = fc.parseISO8601;
var addDays = fc.addDays;
var applyAll = fc.applyAll;

function LoadAgenda() {

//    v
//    var success = sourceOptions.success;
    var data = $.extend({}, {}, {
//        'start-min': formatDate(start, 'u'),
//        'start-max': formatDate(end, 'u'),
        'singleevents': true,
        'futureevents': true,
        'orderby': 'starttime',
        'sortorder':'ascending',
        'max-results': 9999
    });

//    var ctz = sourceOptions.currentTimezone;
//    if (ctz) {
//        data.ctz = ctz = ctz.replace(' ', '_');
//    }
    $.ajax({
        url: 'http://www.google.com/calendar/feeds/rpxxxiv@gmail.com/public/full?alt=json-in-script&callback=?',
        dataType: 'jsonp',
        data: data,
        startParam: false,
        endParam: false,
        success: function (data) {
            var events = [];
            if (data.feed.entry) {
                $.each(data.feed.entry, function (i, entry) {
                    events.push(jsonCreateCalendarItem(entry));
                });
            }
            //            events.sort(function (a, b) { return new Date(a.StartDateSort) - new Date(b.StartDateSort); });
            $("#Event").tmpl(events).appendTo("#Events");

            $(".EventItem").click(function (data) {
                var d = $(this).attr('data-url');
                window.open(d, 'gcalevent', 'width=700,height=600');
            });
        }
    });
    function jsonCreateCalendarItem(entry) {
        var calItem = new Object();
        calItem.url = entry.link[0].href;
        calItem.title = entry.title.$t;
        calItem.content = entry.content.$t;
        if (entry['gd$when']) {
            var startStr = parseISO8601(entry['gd$when'][0].startTime, true);
            var endStr = parseISO8601(entry['gd$when'][0].endTime, true);
            var sd = new Date(startStr);  //new Date(entry['gd$when'][0].startTime);
            var ed = new Date(endStr);
            calItem.StartDateSort = sd;
            calItem.EndDateSort = ed;
            calItem.startTime = ((sd.getHours() > 12) ? sd.getHours() - 12 : (sd.getHours() == 0) ? '12' : sd.getHours()) + ':' + ((sd.getMinutes() < 10) ? '0' + sd.getMinutes() : sd.getMinutes()) + ' ' + ((sd.getHours() >= 12) ? 'PM' : 'AM');
            calItem.endTime = ((ed.getHours() > 12) ? ed.getHours() - 12 : (ed.getHours() == 0) ? '12' : ed.getHours()) + ':' + ((ed.getMinutes() < 10) ? '0' + ed.getMinutes() : ed.getMinutes()) + ' ' + ((ed.getHours() >= 12) ? 'PM' : 'AM');
            sd.setHours(0, 0, 0);
            ed.setHours(0, 0, 0);
            calItem.startDate = (sd.getMonth() + 1) + '/' + sd.getDate() + '/' + sd.getFullYear();
            calItem.endDate = (ed.getMonth() + 1) + '/' + ed.getDate() + '/' + ed.getFullYear(); ;
            calItem.Time = calItem.startTime + ' - ' + calItem.endTime;
            calItem.EventDate = calItem.startDate;
            if (entry['gd$when'][0].startTime.indexOf('T') == -1) {
                calItem.Time = 'All Day';
            }

            if (Date.parse(calItem.endDate) > Date.parse(calItem.startDate)) {
                calItem.EventDate = calItem.startDate + ' - ' + calItem.endDate;
            }
        }
        if (entry['gd$where']) {
            calItem.where = entry['gd$where'][0].valueString;
        }
        return calItem;
    }
    function CreateCalendarItem(entry) {
        var calItem = new Object();
        calItem.title = $('title', entry).text();
        calItem.content = $('content', entry).text();
//        var dateObj = $('gd\\:when', entry);
        //        calItem.sd = $(entry).find("gd\\:when").attr('startTime');  //$('gd\:when',entry).attr('startTime');

        if ($(entry).find("gd\\:when")) {
            var sd = new Date($(entry).find("gd\\:when").attr('startTime'));
            var ed = new Date($(entry).find("gd\\:when").attr('endTime'));
            calItem.startTime = ((sd.getHours() > 12) ? sd.getHours() - 12 : (sd.getHours() == 0) ? '12' : sd.getHours()) + ':' + ((sd.getMinutes() < 10) ? '0' + sd.getMinutes() : sd.getMinutes()) + ' ' + ((sd.getHours() >= 12) ? 'PM' : 'AM');
            calItem.endTime = ((ed.getHours() > 12) ? ed.getHours() - 12 : (ed.getHours() == 0) ? '12' : ed.getHours()) + ':' + ((ed.getMinutes() < 10) ? '0' + ed.getMinutes() : ed.getMinutes()) + ' ' + ((ed.getHours() >= 12) ? 'PM' : 'AM');
            sd.setHours(0, 0, 0);
            ed.setHours(0, 0, 0);
            calItem.startDate = (sd.getMonth() + 1) + '/' + sd.getDate() + '/' + sd.getFullYear();
            calItem.endDate = (ed.getMonth() + 1) + '/' + ed.getDate() + '/' + ed.getFullYear(); ;

            if (Date.parse(calItem.endDate) > Date.parse(calItem.startDate)) {
                calItem.Date = calItem.startDate + ' - ' + calItem.endDate;
            }
        }
        if ($(entry).find("gd\\:where")) {
            calItem.where = $(entry).find("gd\\:where").attr('valueString');
        }
        return calItem;
    }
}