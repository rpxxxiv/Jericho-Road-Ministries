/*
 * FullCalendar v1.5.3 Google Calendar Plugin
 *
 * Copyright (c) 2011 Adam Shaw
 * Dual licensed under the MIT and GPL licenses, located in
 * MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
 *
 * Date: Mon Feb 6 22:40:40 2012 -0800
 *
 */
 
(function ($) {


    var fc = $.fullCalendar;
    var formatDate = fc.formatDate;
    var parseISO8601 = fc.parseISO8601;
    var addDays = fc.addDays;
    var applyAll = fc.applyAll;
    var events = [];

    fc.sourceNormalizers.push(function (sourceOptions) {
        if (sourceOptions.dataType == 'gcal' ||
		sourceOptions.dataType === undefined &&
		(sourceOptions.url || '').match(/^(http|https):\/\/www.google.com\/calendar\/feeds\//)) {
            sourceOptions.dataType = 'gcal';
            if (sourceOptions.editable === undefined) {
                sourceOptions.editable = false;
            }
        }
    });


    fc.sourceFetchers.push(function (sourceOptions, start, end) {
        if (sourceOptions.dataType == 'gcal') {
            return transformOptions(sourceOptions, start, end);
        }
    });

    function EventObject(entry, ctz) {
        var rec;
        if (entry['gd$recurrence']) {
            recurringEventObject(entry, ctz);
        }
        else {
            var entryObject = new Object();

            entryObject.id = entry['gCal$uid']['value'];
            entryObject.title = entry['title']['$t'];
            var url;
            $.each(entry.link, function (i, link) {
                if (link.type == 'text/html') {
                    url = link.href;
                    if (ctz) {
                        url += (url.indexOf('?') == -1 ? '?' : '&') + 'ctz=' + ctz;
                    }
                }
            });
            entryObject.url = url;


            var startStr = entry['gd$when'][0]['startTime'];
            entryObject.start = parseISO8601(startStr, true);
            entryObject.end = parseISO8601(entry['gd$when'][0]['endTime'], true);
            entryObject.allDay = startStr.indexOf('T') == -1;
            if (entryObject.allDay) {
                addDays(entryObject.end, -1); // make inclusive
            }
            entryObject.location = entry['gd$where'][0]['valueString'];
            entryObject.description = entry['content']['$t']

            events.push(entryObject);
        }
    }

    function recurringEventObject(entry, ctz) {
        var entryObject = new Object();


        var url;
        $.each(entry.link, function (i, link) {
            if (link.type == 'text/html') {
                url = link.href;
                if (ctz) {
                    url += (url.indexOf('?') == -1 ? '?' : '&') + 'ctz=' + ctz;
                }
            }
        });
        entryObject.url = url;
        var rec = recurrence(entry);

        var startStr = rec.startStr;

        entryObject.id = entry['gCal$uid']['value'];
        entryObject.title = entry['title']['$t'];
        entryObject.start = startStr;
        entryObject.end = rec.end;
        entryObject.allDay = rec.allDay;
        if (entryObject.allDay) {
            addDays(entryObject.end, -1); // make inclusive
        }
        entryObject.location = entry['gd$where'][0]['valueString'];
        entryObject.description = entry['content']['$t'];

        var rule = new Scheduler(entryObject.start, rec.rrule);

        switch (rule.rrule_freq) {
            case 'DAILY':
                if (rule.rrule_count) {
                    var dCount = rule.rrule_count.substring(0, rule.rrule_count.indexOf('BEGIN') || rule.rrule_count.length);
                    for (var i = 0; i < dCount; i++) {
                        var a = new Date(entryObject.start);
                        a.setDate(a.getDate() + (rule.rrule_interval * i));
                    }
                }
                break;
            case 'WEEKLY':
                break;
            case 'MONTHLY':
                break;
            case 'YEARLY':
                break;
            default:
                break;
        }

    }






    function transformOptions(sourceOptions, start, end) {

        var success = sourceOptions.success;
        var data = $.extend({}, sourceOptions.data || {}, {
            //            'start-min': formatDate(start, 'u'),
            //            'start-max': formatDate(end, 'u'),
            'singleevents': false,
            'max-results': 9999
        });

        var ctz = sourceOptions.currentTimezone;
        if (ctz) {
            data.ctz = ctz = ctz.replace(' ', '_');
        }

        return $.extend({}, sourceOptions, {
            url: sourceOptions.url.replace(/\/basic$/, '/full') + '?alt=json-in-script&callback=?',
            dataType: 'jsonp',
            data: data,
            startParam: false,
            endParam: false,
            success: function (data) {
                //var events = [];
                if (data.feed.entry) {
                    $.each(data.feed.entry, function (i, entry) {

                        EventObject(entry, ctz);
                    });
                }
                var args = [events].concat(Array.prototype.slice.call(arguments, 1));
                var res = applyAll(success, this, args);
                if ($.isArray(res)) {
                    return res;
                }
                //events.sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
                return events;
            }
        });

    }


    // legacy
    fc.gcalFeed = function (url, sourceOptions) {
        return $.extend({}, sourceOptions, { url: url, dataType: 'gcal' });
    };

    function recurrence(entry) {


        var recurrence = new Object();


        var l = entry['gd$recurrence'].$t;
        var s = l.substring(l.indexOf('RRULE'), l.length);
        l = l.replace('DTSTART;VALUE=DATE:', '')
        l = l.replace('DTEND;VALUE=DATE:', ';');
        l = l.replace(s, '');

        var dates = l.split(';');
        var syear = dates[0].substring(0, 4); // +'/' + dates[0].substring(5, 2) + '/' + dates[0].substring(7, 2);
        var smonth = dates[0].substring(4, 6);
        var sday = dates[0].substring(6, 8);

        recurrence.startStr = new Date(syear, smonth, sday);
        recurrence.start = recurrence.startStr;

        var eyear = dates[1].substring(0, 4); // +'/' + dates[0].substring(5, 2) + '/' + dates[0].substring(7, 2);
        var emonth = dates[1].substring(4, 6);
        var eday = dates[1].substring(6, 8);

        recurrence.end = new Date(eyear, emonth, eday);
        recurrence.allDay = true;
        recurrence.rrule = s;



        return recurrence;
    }
})(jQuery);
