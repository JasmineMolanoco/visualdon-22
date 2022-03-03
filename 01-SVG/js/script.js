function domForEach(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
}

function domOn(selector, event, callback) { 
    domForEach(selector, element => element.addEventListener(event, callback));
}

function isOdd(num) {
    if (num % 2 == true) {
    }
    return num % 2;
}


domOn('.rectangle', 'click', evt => {
    const monRectangle = evt.target;
    const color = monRectangle.getAttribute('fill');

    if (color == "black") {
        monRectangle.setAttribute('fill', 'blue');

    } else {
        monRectangle.setAttribute('fill', 'black');

    }

})


domOn('.trou-donut', 'mouseover', evt => {
    const monDonut = evt.target;
    console.log(monDonut);
    const rayon = monDonut.getAttribute('r');
    if (rayon <= 60) {
        monDonut.setAttribute('r', rayon * 2)
    } else {
        monDonut.setAttribute('r', rayon * 0.5)
    }

});