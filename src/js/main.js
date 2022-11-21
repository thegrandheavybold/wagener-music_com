import  gsap  from 'gsap';
import  ScrollTrigger  from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);



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
