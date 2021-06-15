class AutoScroll {

    constructor() {
        // settings
        this.sensitivity = 0.4;

        console.log("Autoscroll instantiated 2");

        this.preventClick = false;

        this.prevYoffset = 0;
        this.prevYspeed = 0;

        this.scrollSpeed = 0;
        this.touchDown = false;
        this.resetSpeed = false;

        this.scrollSpeedDetectionInterval = 10;
        this.scrollInterval = 10;

        this.referenceBeta = 0;
        this.beta = 0;

        var self = this;

        this.deviceMotionExecuted = false;
        this.shouldTilt = false;

        setInterval(function() {
            self.detectScrollSpeed();
        }, this.scrollSpeedDetectionInterval);

        setInterval(function() {
            self.scroll();
        }, this.scrollInterval);

        window.addEventListener('touchstart', function() {
            self.touchDown = true;
            self.preventClick = (self.scrollSpeed != 0);
            if (self.preventClick) {
                console.log("prevent", self.scrollSpeed);
            }
        });

        window.addEventListener('touchend', function() {
            if (self.touchDown == true) {
                self.touchDown = false;
                self.resetSpeed = true;
                self.touchEndTime = Date.now();
            }
        });

        window.addEventListener('touchcancel', function() {
            if (self.touchDown == true) {
                self.touchDown = false;
                self.resetSpeed = true;
                self.touchEndTime = Date.now();
            }
        });

        window.addEventListener('touchmove', function() {
            self.touchDown == true;
        });

        window.addEventListener('click', function(e) {
            if (self.deviceMotionExecuted === false) {
                console.log("here?");
                self.deviceMotionExecuted = true;
                self.requestDeviceMotionPermissions();
            }

            if (self.preventClick) {
                e.preventDefault();
                this.shouldTilt = false;
            }
        });

        window.addEventListener('mouseup', function(e) {
            if (self.preventClick) {
                e.preventDefault();
            }
        });
    }

    detectScrollSpeed() {
        const currentYoffset = window.pageYOffset
        const differenceYoffset = currentYoffset - this.prevYoffset;
        const ySpeed = differenceYoffset;
        if (this.resetSpeed == true) {
            this.resetSpeed = false;
            this.scrollSpeed = this.sensitivity * this.prevYspeed * this.scrollInterval / this.scrollSpeedDetectionInterval;
            console.log("engage at speed", ySpeed, this.prevYspeed, this.scrollSpeed);
            this.shouldTilt = (this.scrollSpeed != 0);
        }
        this.prevYoffset = currentYoffset;
        this.prevYspeed = ySpeed;
    }

    scroll() {
        if (this.touchDown === false) {
            const speed = this.scrollSpeed + this.speedFromTilt();
            window.scrollBy(0, speed);
        }
    }

    requestDeviceMotionPermissions() {
        var self = this;
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+
            DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('deviceorientation', (e) => {
                        self.beta = e.beta;
                        if (self.touchDown === true) {
                            self.referenceBeta = e.beta;
                            document.getElementById("status").innerHTML = e.beta;
                        }
                    })
                }
            })
            .catch(console.error)

        } else {
            // non iOS 13+
        }
    }

    speedFromTilt() {
        if (this.shouldTilt === false) {
            return 0;
        }
        const beta = this.beta - this.referenceBeta;
        return -0.1 * beta;
    }
}

window.autoscroller = null;

window.addEventListener("load", () => {
    if (window.autoscroller === null) {
        window.autoscroller = new AutoScroll();
    }
});
