function tableToArray(table) {
    let result = [];
    let rows = table.rows;
    let cells, t;
    const regex = /href="(.+?)"/gm;

  // Iterate over rows
    let str;
    let i = 0, iLen = rows.length;
    for (; i < iLen; i++) {
        cells = rows[i].cells;
        t = [];

        // Iterate over cells
        for (let j = 0, jLen = cells.length - 1; j < jLen; j++) {
            t.push(cells[j].textContent);
        }
        str = cells[cells.length - 1].innerHTML;
        let res = str.match(/href="(.+?)"/);
        if (res != null) {
            t.push("https://www.ims.tau.ac.il" + res[1])
            result.push(t);
        }


    }
  return result;
}


function get_classes(){
	let arr = tableToArray($("table[bordercolor='skyblue']")[0]);
	let classes = [];
    let lesson;
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (item[3].trim() !== "משאבי הספריה") {
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


function download_calendar(){
    let calendar="BEGIN:VCALENDAR\n";
    calendar+="VERSION:2.0\n";
    calendar+="BEGIN:VTIMEZONE\n";
	calendar+="TZID:Asia/Jerusalem\n"
    calendar+="END:VTIMEZONE\n";
    let classes = get_classes();
    for (let i=0; i<classes.length; i++){
        const lesson = classes[i];
        calendar+=createIcalEvent(lesson);
    }

    calendar+="END:VCALENDAR\n";
    download_file("my_calendar.ics", calendar);
}





function firstDay(date, day_str) {
	day_str = day_str.trim().replace('#','').replace('&','').replace('!','')
	d = {"א":0,"ב":1,"ג":2,"ד":3,"ה":4,"ו":5};
    let tempDate = new Date(date);

    let day = tempDate.getDay();
    let toNextday = day !== d[day_str] ? (7 - day + d[day_str])% 7 : 0;
    tempDate.setDate(tempDate.getDate() + toNextday);
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
	var localISOTime = (new Date(tempDate - tzoffset))
    return localISOTime.toISOString().split('T')[0].replaceAll('-','').trim();
}



function createIcalEvent(lesson){
    const semester_a_start = "2020-10-18T00:00:00";
    const semester_a_ends = "20210117T235959Z";
    const semester_b_start = "2021-03-03T00:00:00";
    const semester_b_ends = "20210618T235959Z";

    if(!lesson.hours.includes("-")){
		return "";
	}
    let freq = "FREQ=WEEKLY;";
	// if lesson.day.includes("#"){

	// }
    let until;
    let firstday;
    if (lesson.semester.includes("א")) {
        until = semester_a_ends
        firstday = firstDay(semester_a_start, lesson.day);
    } else {
        until = semester_b_ends;
        firstday = firstDay(semester_b_start, lesson.day);
    }
    let spl = lesson.hours.replace('^', '').trim().split('-');
    let start = firstday + "T" + spl[0].replace(':', "") + '00';
    let end = firstday + "T" + spl[1].replace(':', "") + '00';
    let result = "BEGIN:VEVENT\n";
    result+="DTSTART;TZID=Asia/Jerusalem:"+start+"\n";
    result+="DTEND;TZID=Asia/Jerusalem:"+end+"\n";
  	result+="RRULE:"+freq+"UNTIL="+until+"\n";
    result+="SUMMARY:"+lesson.name+"- "+get_type(lesson.type)+"\n";
    result+="LOCATION:"+lesson.location+"\n";
    result+="DESCRIPTION: מספר קורס: "+lesson.course_num+"\\nמרצה: "+lesson.lectuer+"\\nסילבוס: "+lesson.syl_link+"\n";
    result+="END:VEVENT\n";
    return result;
}

function get_type(old_type){
	old_type = old_type.trim();
    let d = {'שעור': "שיעור", "תרג": "תרגול", "פרקט": "פרויקט"};
	if(old_type in d){
		return d[old_type];
	}
	return old_type;
}


function download_file(name, contents, mime_type) {
    mime_type = mime_type || "text/plain";

    let blob = new Blob([contents], {type: mime_type});

    let dlink = document.createElement('a');
    dlink.download = name;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function(e) {
        // revokeObjectURL needs a delay to work properly
        let that = this;
        setTimeout(function() {
            window.URL.revokeObjectURL(that.href);
        }, 1500);
    };

    dlink.click();
    dlink.remove();

}
