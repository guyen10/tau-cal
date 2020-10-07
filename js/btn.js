
function addButton(){
    // adds the code for downloading to page
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('js/cal.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    // retrive the table from page and adds a button on the first row
    let t = $("table[bordercolor='skyblue']")[0]
    let th = t.rows[0].cells[t.rows[0].cells.length-1]
    th.innerHTML = '<button id="down_btn" style="font-size: 16px;background-color: #f44336;border-radius: 8px;font-weight: bold" type="button" onclick="download_calendar();">יצא מערכת<br/> לקובץ↓</button>'


}

addButton();
