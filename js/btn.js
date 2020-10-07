function addButton(){
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('js/cal.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    let t = $("table[bordercolor='skyblue']")[0]
    let th = t.rows[0].cells[t.rows[0].cells.length-1]
    th.innerHTML = '<button id="down_btn" style="font-size: 16px;background-color: #f44336;border-radius: 8px;font-weight: bold" type="button" onclick="download_calendar();">יצא מערכת<br/> לקובץ↓</button>'


}
addButton();
