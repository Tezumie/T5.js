//************************************************************************//
//*******************************-T5Sound-********************************//
//************************************************************************//
T5.addOns.sound = ($, p, globalScope) => {
    class T5Sound {
        constructor(baseT5) {
            this.baseT5 = baseT5;
            this.sound = null;
            this.loaded = false;
            this.looping = false;
            this.playing = false;
            this.paused = false;
            this.volume = 1;
            this.rate = 1;
            this.duration = 0;
        }

        loadSound(path, callback) {
            window.t5PreloadCount++;
            const audio = new Audio();
            this.sound = audio;
            audio.src = path;
            audio.addEventListener('canplaythrough', () => {
                this.loaded = true;
                this.duration = audio.duration;
                window.t5PreloadDone++;
                if (callback) {
                    callback(this);
                }
            }, false);
            audio.addEventListener('error', (e) => {
                console.error(`Failed to load sound: ${path}`, e);
                window.t5PreloadDone++;
                if (callback) {
                    callback(null);
                }
            });
            audio.addEventListener('ended', () => {
                this.playing = false;
            });
            return this;
        }

        isLoaded() {
            return this.loaded;
        }

        async play() {
            if (this.loaded && !this.playing) {
                try {
                    await this.sound.play();
                    this.playing = true;
                    this.paused = false;
                } catch (e) {
                    console.error('Error playing sound:', e);
                }
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
            return this.playing && !this.sound.paused;
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

        getDuration() {
            return this.duration;
        }

        getCurrentTime() {
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

    $.loadSound = function (path, callback) {
        const soundFile = new T5Sound($);
        return soundFile.loadSound(path, callback);
    };

    $.playSound = function (soundFile) {
        if (soundFile) {
            soundFile.play();
        }
    };

    $.pauseSound = function (soundFile) {
        if (soundFile) {
            soundFile.pause();
        }
    };

    $.stopSound = function (soundFile) {
        if (soundFile) {
            soundFile.stop();
        }
    };

    $.loopSound = function (soundFile) {
        if (soundFile) {
            soundFile.loop();
        }
    };

    $.setLoopSound = function (soundFile, loop) {
        if (soundFile) {
            soundFile.setLoop(loop);
        }
    };

    $.isLoopingSound = function (soundFile) {
        return soundFile ? soundFile.isLooping() : false;
    };

    $.isPlayingSound = function (soundFile) {
        return soundFile ? soundFile.isPlaying() : false;
    };

    $.isPausedSound = function (soundFile) {
        return soundFile ? soundFile.isPaused() : false;
    };

    $.setVolumeSound = function (soundFile, volume) {
        if (soundFile) {
            soundFile.setVolume(volume);
        }
    };

    $.getVolumeSound = function (soundFile) {
        return soundFile ? soundFile.getVolume() : 0;
    };

    $.setRateSound = function (soundFile, rate) {
        if (soundFile) {
            soundFile.setRate(rate);
        }
    };

    $.getRateSound = function (soundFile) {
        return soundFile ? soundFile.getRate() : 0;
    };

    $.getDurationSound = function (soundFile) {
        return soundFile ? soundFile.getDuration() : 0;
    };

    $.getCurrentTimeSound = function (soundFile) {
        return soundFile ? soundFile.getCurrentTime() : 0;
    };

    $.jumpSound = function (soundFile, time) {
        if (soundFile) {
            soundFile.jump(time);
        }
    };

    if ($._isGlobal) {
        globalScope.loadSound = $.loadSound;
        globalScope.playSound = $.playSound;
        globalScope.pauseSound = $.pauseSound;
        globalScope.stopSound = $.stopSound;
        globalScope.loopSound = $.loopSound;
        globalScope.setLoopSound = $.setLoopSound;
        globalScope.isLoopingSound = $.isLoopingSound;
        globalScope.isPlayingSound = $.isPlayingSound;
        globalScope.isPausedSound = $.isPausedSound;
        globalScope.setVolumeSound = $.setVolumeSound;
        globalScope.getVolumeSound = $.getVolumeSound;
        globalScope.setRateSound = $.setRateSound;
        globalScope.getRateSound = $.getRateSound;
        globalScope.getDurationSound = $.getDurationSound;
        globalScope.getCurrentTimeSound = $.getCurrentTimeSound;
        globalScope.jumpSound = $.jumpSound;
    }
};

// Integrate the sound add-on
T5.addOns.sound(T5.prototype, T5.prototype, window);
