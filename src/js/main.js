import  { gsap }  from 'gsap';
import  { ScrollTrigger }  from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";


gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);


gsap.from(".o_frst", {
  duration: 1,
  stagger: 1,
  drawSVG: 0,
  ease: 'none',
  scrollTrigger: {
    start: 'top 45%',
    end: 'bottom 75%',
    scrub: 2,
    trigger: ".about .item_2"
  }
});
gsap.from(".o_scnd", {
  duration: 2,
  stagger: 1,
  drawSVG: '50% 50%',
  ease: 'none',
  scrollTrigger: {
    start: 'top 45%',
    end: 'bottom 75%',
    scrub: 2,
    trigger: ".about .item_2"
  }
});

gsap.from(".o_thrd", {
  duration: 2,
  stagger: 1,
  drawSVG: '-0%',
  ease: 'none',
  scrollTrigger: {
    start: 'top 35%',
    end: 'bottom 55%',
    scrub: 2,
    trigger: ".credits .item_3"
  }
});

gsap.from(".o_frth", {
  duration: 2,
  stagger: 1,
  drawSVG: '-0%',
  ease: 'none',
  scrollTrigger: {
    start: 'top 35%',
    end: 'bottom 55%',
    scrub: 2,
    trigger: ".contact .item_3"
  }
});


//gsap scroll animations
const scrolls_l = gsap.utils.toArray('.hxl');
scrolls_l.forEach(hxl => {
  gsap.to(hxl, {
    xPercent: -200,
    scrollTrigger: {
      trigger: hxl,
      scrub: 2
    }
  })
});

const scrolls_r = gsap.utils.toArray('.hxr');
scrolls_r.forEach(hxr => {
  gsap.to(hxr, {
  xPercent: 200,
    scrollTrigger: {
      trigger: hxr,
      scrub: 1.5
    }
  })
});


//gsap outofview imdb list items
const oov = gsap.utils.toArray('.oov');
oov.forEach(oov => {
  gsap.from(oov, {
  y: 150,
  opacity: 0,
    scrollTrigger: {
      trigger: oov,
      scrub: 2,
      end: "bottom 90%"
    }
  })
});

//gsap skew scroll
let proxy = { skew: 0 },
    skewSetter = gsap.quickSetter(".skw", "skewY", "deg"), // fast
    clamp = gsap.utils.clamp(-20, 20); // don't let the skew go beyond 20 degrees.

ScrollTrigger.create({
  onUpdate: (self) => {
    let skew = clamp(self.getVelocity() / -300);
    // only do something if the skew is MORE severe. Remember, we're always tweening back to 0, so if the user slows their scrolling quickly, it's more natural to just let the tween handle that smoothly rather than jumping to the smaller skew.
    if (Math.abs(skew) > Math.abs(proxy.skew)) {
      proxy.skew = skew;
      gsap.to(proxy, {skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew)});
    }
  }
});

// make the right edge "stick" to the scroll bar. force3D: true improves performance
gsap.set(".skw", {transformOrigin: "right center", force3D: true});


// gsap quote soft parallax
const lax = gsap.utils.toArray('.lx');
lax.forEach(lx => {
  gsap.to(lx, {
  y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
    scrollTrigger: {
      trigger: lx,
      scrub: 2
    }
  })
});



import * as PIXI from 'pixi.js';
import { KawaseBlurFilter } from '@pixi/filter-kawase-blur';
import { createNoise2D } from 'simplex-noise';
import hsl from 'hsl-to-hex';
import debounce from 'debounce';

// return a random number within a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// map a number from 1 range to another
function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

// Create a new simplex noise instance
const noise2D = createNoise2D();


// ColorPalette class
class ColorPalette {
  constructor() {
    this.setColors();
  }

  setColors() {
    // define colors
    this.baseColor = hsl(247, 26, 93);
    this.Color1 = hsl(180, 65, 23);
    this.Color2 = hsl(62, 79, 76);
    this.Color3 = hsl(23, 81, 85);

    // store the color choices in an array so that a random one can be picked later
    this.colorChoices = [
      this.baseColor,
      this.Color1,
      this.Color2,
      this.Color3
    ];
  }

  randomColor() {
    // pick a random color
    return this.colorChoices[~~random(0, this.colorChoices.length)].replace(
      "#",
      "0x"
    );
  }

}


// Orb class
class Orb {
  // Pixi takes hex colors as hexidecimal literals (0x rather than a string with '#')
  constructor(fill = 0x000000) {
    // bounds = the area an orb is "allowed" to move within
    this.bounds = this.setBounds();
    // initialise the orb's { x, y } values to a random point within it's bounds
    this.x = random(this.bounds["x"].min, this.bounds["x"].max);
    this.y = random(this.bounds["y"].min, this.bounds["y"].max);

    // how large the orb is vs it's original radius (this will modulate over time)
    this.scale = 1;

    // what color is the orb?
    this.fill = fill;

    // the original radius of the orb, set relative to window height
    this.radius = random(window.innerHeight / 6, window.innerHeight / 3);

    // starting points in "time" for the noise/self similar random values
    this.xOff = random(0, 1000);
    this.yOff = random(0, 1000);
    // how quickly the noise/self similar random values step through time
    this.inc = 0.0015;

    // PIXI.Graphics is used to draw 2d primitives (in this case a circle) to the canvas
    this.graphics = new PIXI.Graphics();
    this.graphics.alpha = 0.825;

    // 250ms after the last window resize event, recalculate orb positions.
    window.addEventListener(
      "resize",
      debounce(() => {
        this.bounds = this.setBounds();
      }, 250)
    );

  }

  setBounds() {
    // how far from the { x, y } origin can each orb move
    const maxDist =
      window.innerWidth < 1000 ? window.innerWidth / 3 : window.innerWidth / 5;
    // the { x, y } origin for each orb (the bottom right of the screen)
    const originX = window.innerWidth / 5;
    const originY = window.innerHeight / 4;
      window.innerWidth < 1000
        ? window.innerHeight
        : window.innerHeight / 1.375;

    // allow each orb to move x distance away from it's x / y origin
    return {
      x: {
        min: originX - maxDist,
        max: originX + maxDist
      },
      y: {
        min: originY - maxDist,
        max: originY + maxDist
      }
    };
  }

  update() {
    // self similar "psuedo-random" or noise values at a given point in "time"
    const xNoise = noise2D(this.xOff, this.xOff);
    const yNoise = noise2D(this.yOff, this.yOff);
    const scaleNoise = noise2D(this.xOff, this.yOff);

    // map the xNoise/yNoise values (between -1 and 1) to a point within the orb's bounds
    this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
    this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
    // map scaleNoise (between -1 and 1) to a scale value somewhere between half of the orb's original size, and 100% of it's original size
    this.scale = map(scaleNoise, -1, 1, 0.5, 1);

    // step through "time"
    this.xOff += this.inc;
    this.yOff += this.inc;
  }

  render() {
    // update the PIXI.Graphics position and scale values
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.scale.set(this.scale);

    // clear anything currently drawn to graphics
    this.graphics.clear();

    // tell graphics to fill any shapes drawn after this with the orb's fill color
    this.graphics.beginFill(this.fill);
    // draw a circle at { 0, 0 } with it's size set by this.radius
    this.graphics.drawCircle(0, 0, this.radius);
    // let graphics know we won't be filling in any more shapes
    this.graphics.endFill();
  }
}

// Create PixiJS app
const app = new PIXI.Application({
  view: document.querySelector('.orb-canvas'),
  resizeTo: window,
  transparent: true,
  backgroundAlpha: 0
});

app.stage.filters = [new KawaseBlurFilter(30, 10, false)];

// Create colour palette
const colorPalette = new ColorPalette();

// Create orbs
const orbs = [];

for (let i = 0; i < 10; i++) {
  const orb = new Orb(colorPalette.randomColor());

  app.stage.addChild(orb.graphics);

  orbs.push(orb);
}

// Animate!
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  app.ticker.add(() => {
    orbs.forEach((orb) => {
      orb.update();
      orb.render();
    });
  });
} else {
  orbs.forEach((orb) => {
    orb.update();
    orb.render();
  });
}
