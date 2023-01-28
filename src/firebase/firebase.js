export const firebaseConfig = {
  apiKey: "AIzaSyA8edlxAllxQrdipTg8FT3L6Tn9k484ZQg",
  authDomain: "game-your-fit.firebaseapp.com",
  databaseURL: "https://game-your-fit-default-rtdb.firebaseio.com",
  projectId: "game-your-fit",
  storageBucket: "game-your-fit.appspot.com",
  messagingSenderId: "92336032037",
  appId: "1:92336032037:web:89eb3214cf35017a1f72cc",
  measurementId: "G-HM0LCE3EZN"
};

firebase.initializeApp(firebaseConfig);

export const atics = firebase.analytics();

atics.logEvent("page_view", {
  page_location: "https://gameyourfit.com/game",
  page_path: "/game",
  page_title: "Campaign Game"
});