//Get image
var img = document.createElement("img");
img.src = "https://www.freeimages.com/photo/batting-10-1557105";
var src = document.getElementById("image");
src.appendChild(img);


//Random quotes
let quotesDiv = document.getElementById('quotes')
fetch('https://api.kanye.rest')
    .then(res => res.json())
    .then(quote => (
        quotesDiv.innerHTML += <p> ${quote.quote} </p>
    ))
let mlbButton = document.getElementById('image')
mlbButton.addEventListener("click", evt => {
    let mlbDiv = document.getElemnetById('image')
    fetch()
})