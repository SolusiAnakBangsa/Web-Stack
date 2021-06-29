/**
 * {HTMLElements}
 */
let gameBtns = [];
let gameDisps = [];

function handleGameBtn(el) {
    for (dis of gameDisps) {
        dis.classList.add("hide");
    }
    for (btn of gameBtns) {
        btn.classList.remove("zoomed");
        btn.classList.remove("blue-grey");
        btn.classList.remove("lighten-5");
    }
    el.classList.add("zoomed");
    el.classList.add("blue-grey");
    el.classList.add("lighten-5");
}

document.addEventListener( 'DOMContentLoaded', function () {
    // Enable game buttons
    const campBtn = document.getElementById("campaign-button");
    const cardBtn = document.getElementById("cardiocam-button");
    gameBtns = [campBtn, cardBtn];

    // Game displays
    const campDis = document.getElementById("cam-dis");
    const cardDis = document.getElementById("car-dis");
    gameDisps = [campDis, cardDis];

    handleGameBtn(cardBtn);
    cardDis.classList.remove("hide");

    campBtn.addEventListener("click", function() {
        handleGameBtn(this);
        campDis.classList.remove("hide");
    });

    cardBtn.addEventListener("click", function() {
        handleGameBtn(this);
        cardDis.classList.remove("hide");
    });

    // Enable mobile sidenav
    const side = document.querySelectorAll('.sidenav');
    M.Sidenav.init(side, {});

    // Enable screenshots slideshow
    new Splide( '.splide', {
        type: 'loop',
        height: "56.25%",
        width: "100%",
        focus: 'center',
        trimSpace: false,
        gap: "5vw",
        autoplay: false,
        cover: true,
    } ).mount();

    // Enable man slideshow
    var elems = document.querySelectorAll('.carousel');
    var cars = M.Carousel.init(elems, {
        duration: 50,
    });

    setInterval(() => {
        cars[0].next();
    }, 3000);
});