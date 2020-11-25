
// Quote Change

const headerQuotes =  document.querySelectorAll('h1');
let q=0;

function quotesChange() {
    headerQuotes[q].style.display = "none";
    if(q < headerQuotes.length - 1) {
        q++;
    }else {q = 0;}

    headerQuotes[q].style.display = "block";
    setTimeout('quotesChange()', 6000);
}

window.onload(quotesChange());





