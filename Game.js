class Game {
    constructor() {
        this.saws = [];
        this.nextSaws = millis() + 1500;

        this.scraps = [];

        this.points = 0;

        this.player = new Player();
        this.player.hitGroundEvent = this.playerHitGround.bind(this);

        this.timer = 60000;

        this.gameOver = false;
    }

    display() {
        fill(colors.dark);
        textSize(150);
        text(this.points, width / 2, height / 2);

        this.player.draw();
        this.saws.forEach(s => s.draw());
        this.scraps.forEach(s => s.draw());

        fill(0);
        rect(0, height - 30, width, 30);
        fill(colors.lightpurple);
        let progress = 1 - (this.timer) / 60000;
        rect(0, height - 25, width, 25);
        fill(colors.purple);
        rect(0, height - 25, width * progress, 25);
        textAlign(RIGHT);
        textSize(25);
        fill(colors.dark);
        text(`${60 - floor(progress * 60)}s`, width - 2, height - 12);
        textAlign(CENTER);
    }

    step() {
        if (this.gameOver) {
            this.display();
            return;
        }
        this.timer -= deltaTime;
        if (this.timer < 0) this.gameOver = true;

        this.player.step();

        if (millis() > this.nextSaws) {
            let r = random(1);
            let c = 1;

            let two_blades = map(this.points, 5, 15, 0.5, 1, true);
            let thr_blades = map(this.points, 10, 20, 0, 0.5, true);

            if (two_blades > r) c++;
            if (thr_blades > r) c++;

            for (let i = 0; i < c; i++) {
                this.saws.push(new SawBlade());
            }

            this.nextSaws += 1500;
        }

        for (let i = this.saws.length - 1; i >= 0; i--) {
            let saw = this.saws[i];
            if (saw.vel.y < 0 && saw.pos.y < -saw.s) {
                this.saws.splice(i, 1);
                continue;
            }
            saw.step();

            if (this.player.pos.y < saw.pos.y && abs(this.player.pos.x - saw.pos.x) < saw.s)
                saw.primed = true;

            if (p5.Vector.sub(this.player.pos, saw.pos).mag() < this.player.r + saw.r) {
                this.gameOver = true;
                break;
            }
        }

        for (let i = this.scraps.length - 1; i >= 0; i--) {
            let scrap = this.scraps[i];

            if (p5.Vector.sub(this.player.pos, scrap.pos).mag() < this.player.r + scrap.r) {
                this.scraps.splice(i, 1);
                this.timer += 1000;
                continue;
            }
            scrap.step();
        }


        this.display();
    }

    playerHitGround() {
        let sawsBroken = 0;
        for (let i = this.saws.length - 1; i >= 0; i--) {
            let saw = this.saws[i];
            if (!saw.primed) continue;

            this.saws.splice(i, 1);
            sawsBroken++;

            for (let j = 0; j < sawsBroken; j++)
                this.scraps.push(new Scrap(saw.pos.x, saw.pos.y));
        }
        this.points += sawsBroken;
    }
}


