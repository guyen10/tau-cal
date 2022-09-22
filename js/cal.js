// convert html table to array of arrays
function tableToArray(table) {
    let result = [];
    let rows = table.rows;
    let cells, t;

    let str;
    let i = 0, iLen = rows.length;
    // Iterate over rows
    for (; i < iLen; i++) {
        cells = rows[i].cells;
        t = [];

        // Iterate over cells
        for (let j = 0, jLen = cells.length - 1; j < jLen; j++) {
            t.push(cells[j].textContent);
        }

        //  handle last link for syllabus
        str = cells[cells.length - 1].innerHTML;
        let res = str.match(/href="(.+?)"/);
        if (res != null) {
            // fix link for syllabus
            let uri = res[1].replace(/&amp;req=[^&]+/g, '').replace(/&amp;/g, '&');
            t.push("https://www.ims.tau.ac.il" + uri)
            result.push(t);
        }


    }
    return result;
}

// returns list of classes objects
function get_classes() {
    let arr = tableToArray($("table[bordercolor='skyblue']")[0]);
    let classes = [];
    let lesson;
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (item[8].trim() !== "") {
            let lesson = new Object();
            lesson.course_num = item[1];
            lesson.group = item[2];
            lesson.name = item[3];
            lesson.type = item[4];
            lesson.lectuer = item[6];
            lesson.semester = item[7];
            lesson.day = item[8];
            lesson.hours = item[9];
            lesson.location = item[10] + item[11];
            lesson.syl_link = item[12];

            classes.push(lesson)
        }

    }

    return classes

}

// get the first date of a day after certain date
function firstDay(date, day_str) {
    day_str = day_str.trim().replace(/[&%#*!]/g, '');
    d = {"א": 0, "ב": 1, "ג": 2, "ד": 3, "ה": 4, "ו": 5};
    let tempDate = new Date(date);

    let day = tempDate.getDay();
    let toNextday = day !== d[day_str] ? (7 - day + d[day_str]) % 7 : 0;
    tempDate.setDate(tempDate.getDate() + toNextday);
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(tempDate - tzoffset))
    return localISOTime.toISOString().split('T')[0].replace(/-/g, '').trim();
}

// mapping of years to the semeters dates
year_to_dates = {
    '2020': {
        "semester_a_start": "2020-10-18T05:00:00",
        "semester_a_ends": "20210117T235959Z",
        "semester_b_start": "2021-03-03T05:00:00",
        "semester_b_ends": "20210618T235959Z"
    },
    '2021': {
        "semester_a_start": "2021-10-10T05:00:00",
        "semester_a_ends": "20220109T235959Z",
        "semester_b_start": "2022-02-20T05:00:00",
        "semester_b_ends": "20220610T235959Z"
    },
    '2022': {
        "semester_a_start": "2022-10-23T05:00:00",
        "semester_a_ends": "20230122T235959Z",
        "semester_b_start": "2023-03-12T05:00:00",
        "semester_b_ends": "20230630T235959Z"
    }
}


// create recurrent event per lesson
function createIcalEvent(lesson, dates) {


    if (!lesson.hours.includes("-")) {
        return "";
    }
    let freq = "FREQ=WEEKLY;";
    let until;
    let firstday;

    //get the first date of a day (Sunday,Monday etc..) after the semester starts
    if (lesson.semester.includes("א")) {
        until = dates["semester_a_ends"]
        firstday = firstDay(dates["semester_a_start"], lesson.day);
    } else {
        until = dates["semester_b_ends"];
        firstday = firstDay(dates["semester_b_start"], lesson.day);
    }

    let spl = lesson.hours.replace('^', '').trim().split('-');
    let start = firstday + "T" + spl[0].replace(':', "") + '00';
    let end = firstday + "T" + spl[1].replace(':', "") + '00';
    let result = "BEGIN:VEVENT\n";
    result += "DTSTART;TZID=Asia/Jerusalem:" + start + "\n";
    result += "DTEND;TZID=Asia/Jerusalem:" + end + "\n";
    result += "RRULE:" + freq + "UNTIL=" + until + "\n";
    result += "SUMMARY:" + lesson.name + "- " + get_type(lesson.type) + "\n";
    result += "LOCATION:" + lesson.location + "\n";
    result += "DESCRIPTION: מספר קורס: " + lesson.course_num + "\\nקבוצה: " + lesson.group + "\\nמרצה: " + lesson.lectuer + "\\nסילבוס: " + lesson.syl_link + "\n";
    result += "END:VEVENT\n";
    return result;
}

// convert lesson type to more readable string
function get_type(old_type) {
    old_type = old_type.trim();
    let d = {'שעור': "שיעור", "תרג": "תרגול", "פרקט": "פרויקט"};
    if (old_type in d) {
        return d[old_type];
    }
    return old_type;
}

// downloads a text file
function download_file(name, contents, mime_type) {
    mime_type = mime_type || "text/plain";

    let blob = new Blob([contents], {type: mime_type});

    let dlink = document.createElement('a');
    dlink.download = name;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function (e) {
        // revokeObjectURL needs a delay to work properly
        let that = this;
        setTimeout(function () {
            window.URL.revokeObjectURL(that.href);
        }, 1500);
    };

    dlink.click();
    dlink.remove();

}

// downloads the calendar file
function download_calendar() {
    let calendar = "BEGIN:VCALENDAR\n";
    calendar += "VERSION:2.0\n";
    calendar += "BEGIN:VTIMEZONE\n";
    calendar += "TZID:Asia/Jerusalem\n"
    calendar += "END:VTIMEZONE\n";
    let classes = get_classes();

    let year_str = $('select[name*="lstSem"]').val().substring(0, 4);
    let dates = year_to_dates[year_str];

    for (let i = 0; i < classes.length; i++) {
        const lesson = classes[i];
        calendar += createIcalEvent(lesson, dates);
    }

    calendar += "END:VCALENDAR\n";
    download_file("my_calendar.ics", calendar);
}