export class MusicPlayer {
    constructor() {
        // Stores all the music with their name.
        this.musicList = {};

        // The duration to crossfade between the songs.
        this.fadeDuration = 3;

        // Boolean flag to keep track when song is transitioning.
        this._transitioning = false;

        // Global volume for the music player.
        this.volume = 0;
        this._internalVolume = 0;

        // Track all music playing.
        this._prevMusic;
        this.currentMusic;
    }

    play(music) {
        // Plays the selected music.
        // If a song is already playing, then it will crossfade to the target song.

        if (this.currentMusic !== undefined) {
            // If there is a song currently playing, set that song to be the previous.
            this._prevMusic = this.currentMusic;
        }

        // Set the current music.
        this.currentMusic = this.musicList[music];

        // Set volume to be 0, and play it.
        this._internalVolume = 0;
        this.currentMusic.volume = 0;
        this.currentMusic.play({
            loop: true,
        });

        // Set flag to be true.
        this._transitioning = true;
    }

    loop(delta) {
        // Place this inside the main loop.

        // If a fade event is going on, then do stuff.
        if (this._transitioning) {
            const curMusic = this.currentMusic;
            const prevMusic = this._prevMusic;

            // Add the volume.
            this._internalVolume += delta / (1000 * this.fadeDuration);
            curMusic.volume = this._internalVolume * this.volume;

            // Sets the previous music volume, if there is one.
            if (prevMusic !== undefined)
                prevMusic.volume = this.volume - curMusic.volume;

            // If the volume is already at 100%, stop the event, and cap the volume.
            if (curMusic.volume >= this.volume) {
                curMusic.volume = this.volume;
                this._transitioning = false;

                // Stop the previous music if it exists, and sets it to undefined.
                if (prevMusic !== undefined) {
                    prevMusic.volume = 0;
                    prevMusic.stop();
                    this._prevMusic = undefined;
                }
            }
        }
    }

    addMusic(name, music) {
        this.musicList[name] = music;
    }

    addSlider(element) {
        // Add a volume slider listener.
        element.oninput = () => {
            this.volume = (element.value << 0) / 100;
            this._handleVolume();
        };
        element.oninput();
    }

    stop() {}

    pause() {}

    _handleVolume() {
        const curMusic = this.currentMusic;
        const prevMusic = this._prevMusic;

        if (curMusic !== undefined)
            curMusic.volume = this._internalVolume * this.volume;

        if (prevMusic !== undefined)
            prevMusic.volume = this.volume - curMusic.volume;
    }
}
