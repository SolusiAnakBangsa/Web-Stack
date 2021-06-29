/**
 * {HTMLElements}
 */
let gameBtns = [];

function handleGameBtn(el) {
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
    handleGameBtn(cardBtn);

    campBtn.addEventListener("click", function() {
        handleGameBtn(this);
    });

    cardBtn.addEventListener("click", function() {
        handleGameBtn(this);
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