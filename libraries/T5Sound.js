//*************************************************************************//
//********************************-T5Sound-********************************//
//*************************************************************************//

class T5Sound {
    constructor(baseT5) {
        this.baseT5 = baseT5;
        this.sound = null;
        this.loaded = false;
        this.looping = false;
        this.playing = false;
        this.paused = false;
        this.panValue = 0;
        this.volume = 1;
        this.rate = 1;
        this.duration = 0;
    }

    loadSound(path, callback) {
        const audio = new Audio();
        audio.src = path;
        audio.addEventListener('canplaythrough', () => {
            this.sound = audio;
            this.loaded = true;
            this.baseT5.assetsLoadedCount++;
            this.duration = audio.duration;
            if (callback) {
                callback(this);
            }
        }, false);
        audio.addEventListener('error', (e) => {
            console.error(`Failed to load sound: ${path}`, e);
            this.baseT5.assetsLoadedCount++;
            if (callback) {
                callback(null);
            }
        });
        this.baseT5.assetsToLoad++;

    }

    isLoaded() {
        return this.loaded;
    }

    play() {
        if (this.loaded) {
            this.sound.play();
            this.playing = true;
            this.paused = false;
        }
    }

    pause() {
        if (this.loaded && this.playing) {
            this.sound.pause();
            this.playing = false;
            this.paused = true;
        }
    }

    stop() {
        if (this.loaded) {
            this.sound.pause();
            this.sound.currentTime = 0;
            this.playing = false;
            this.paused = false;
        }
    }

    loop() {
        if (this.loaded) {
            this.sound.loop = true;
            this.play();
            this.looping = true;
        }
    }

    setLoop(loop) {
        if (this.loaded) {
            this.sound.loop = loop;
            this.looping = loop;
        }
    }

    isLooping() {
        return this.looping;
    }

    isPlaying() {
        return this.playing;
    }

    isPaused() {
        return this.paused;
    }

    setVolume(volume) {
        if (this.loaded) {
            this.sound.volume = volume;
            this.volume = volume;
        }
    }

    getVolume() {
        return this.volume;
    }

    setRate(rate) {
        if (this.loaded) {
            this.sound.playbackRate = rate;
            this.rate = rate;
        }
    }

    getRate() {
        return this.rate;
    }

    duration() {
        return this.duration;
    }

    currentTime() {
        if (this.loaded) {
            return this.sound.currentTime;
        }
        return 0;
    }

    jump(time) {
        if (this.loaded) {
            this.sound.currentTime = time;
        }
    }
}

function setupT5SoundAliases(baseT5) {
    window.loadSound = function (path, callback) {
        const soundFile = new T5Sound(baseT5);
        soundFile.loadSound(path, callback);
        return soundFile;
    };

    window.playSound = function (soundFile) {
        if (soundFile) {
            soundFile.play();
        }
    };

    window.pauseSound = function (soundFile) {
        if (soundFile) {
            soundFile.pause();
        }
    };

    window.stopSound = function (soundFile) {
        if (soundFile) {
            soundFile.stop();
        }
    };

    window.loopSound = function (soundFile) {
        if (soundFile) {
            soundFile.loop();
        }
    };

    window.setLoopSound = function (soundFile, loop) {
        if (soundFile) {
            soundFile.setLoop(loop);
        }
    };

    window.isLoopingSound = function (soundFile) {
        return soundFile ? soundFile.isLooping() : false;
    };

    window.isPlayingSound = function (soundFile) {
        return soundFile ? soundFile.isPlaying() : false;
    };

    window.isPausedSound = function (soundFile) {
        return soundFile ? soundFile.isPaused() : false;
    };

    window.setVolumeSound = function (soundFile, volume) {
        if (soundFile) {
            soundFile.setVolume(volume);
        }
    };

    window.getVolumeSound = function (soundFile) {
        return soundFile ? soundFile.getVolume() : 0;
    };

    window.setRateSound = function (soundFile, rate) {
        if (soundFile) {
            soundFile.setRate(rate);
        }
    };

    window.getRateSound = function (soundFile) {
        return soundFile ? soundFile.getRate() : 0;
    };

    window.getDurationSound = function (soundFile) {
        return soundFile ? soundFile.duration() : 0;
    };

    window.getCurrentTimeSound = function (soundFile) {
        return soundFile ? soundFile.currentTime() : 0;
    };

    window.jumpSound = function (soundFile, time) {
        if (soundFile) {
            soundFile.jump(time);
        }
    };
}

setupT5SoundAliases(myT5);
