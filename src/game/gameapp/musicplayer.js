const MAXVOLUME = 0.8; // (0 - 1)

export class MusicPlayer {

    constructor() {
        // Stores all the music with their name.
        this.musicList = {}
        
        // The duration to crossfade between the songs.
        this.fadeDuration = 2;

        // Boolean flag to keep track when song is transitioning.
        this._transitioning = false;

        // Track all music playing.
        this._prevMusic;
        this.currentMusic;
    }

    play(music, isFade) {
        // Plays the selected music.
        // If a song is already playing, then it will crossfade to the target song.
        // if isFade is true, then the songs will crossfade.


        if (this.currentMusic !== undefined) {
            // If there is a song currently playing, set that song to be the previous.
            this._prevMusic = this.currentMusic;
        }

        // Set the current music.
        this.currentMusic = this.musicList[music];

        // Set volume to be 0, and play it.
        this.currentMusic.volume = 0;
        this.currentMusic.play({
            loop: true
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
            curMusic.volume += delta/(1000 * this.fadeDuration) * MAXVOLUME;

            // Sets the previous music volume, if there is one.
            if (prevMusic !== undefined)
                prevMusic.volume = MAXVOLUME - curMusic.volume;

            // If the volume is already at 100%, stop the event, and cap the volume.
            if (curMusic.volume >= MAXVOLUME) {
                curMusic.volume = MAXVOLUME;
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

    stop() {

    }

    pause() {

    }

}