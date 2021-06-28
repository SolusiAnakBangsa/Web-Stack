document.addEventListener( 'DOMContentLoaded', function () {
    const side = document.querySelectorAll('.sidenav');
    M.Sidenav.init(side, {});

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

    var elems = document.querySelectorAll('.carousel');
    var cars = M.Carousel.init(elems, {
        duration: 50,
    });

    setInterval(() => {
        cars[0].next();
    }, 3000);
});