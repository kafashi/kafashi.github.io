// Bulk-boundary background: points on a boundary circle, connected through
// the "bulk" by geodesic-like arcs — a nod to Ryu–Takayanagi surfaces /
// tensor-network reconstructions of emergent spacetime.
(function(){
  const canvas = document.getElementById('bulkbg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  const N = 22; // boundary points
  const points = [];
  for(let i=0;i<N;i++){
    points.push({ a: (i / N) * Math.PI * 2, phase: Math.random()*Math.PI*2 });
  }

  // pick a fixed set of chords (boundary-anchored geodesics) once
  const chords = [];
  for(let i=0;i<N;i++){
    const jumps = [3,5,8,11];
    jumps.forEach(j=>{
      const k = (i + j) % N;
      if(i < k) chords.push([i,k]);
    });
  }

  function center(){ return { x: w*0.78, y: h*0.32, r: Math.min(w,h)*0.42 }; }

  function draw(t){
    ctx.clearRect(0,0,w,h);
    const c = center();

    // boundary circle (the CFT)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(228,177,92,0.18)';
    ctx.lineWidth = 1;
    ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.stroke();

    const pos = points.map(p=>{
      const wobble = reduceMotion ? 0 : Math.sin(t*0.00012 + p.phase)*0.012;
      const ang = p.a + wobble;
      return { x: c.x + Math.cos(ang)*c.r, y: c.y + Math.sin(ang)*c.r, ang };
    });

    // boundary points
    pos.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = 'rgba(228,177,92,0.55)';
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2);
      ctx.fill();
    });

    // bulk geodesics: quadratic curves bowing toward the center,
    // depth (bow amount) proportional to chord length -> larger
    // entangling regions reach deeper into the bulk.
    chords.forEach(([i,k], idx)=>{
      const p1 = pos[i], p2 = pos[k];
      const dx = p2.x-p1.x, dy = p2.y-p1.y;
      const midx = (p1.x+p2.x)/2, midy = (p1.y+p2.y)/2;
      const toC = { x: c.x-midx, y: c.y-midy };
      const dist = Math.sqrt(dx*dx+dy*dy);
      const depth = Math.min(dist/ (c.r*2), 1) * 0.55;
      const ctrlx = midx + toC.x*depth;
      const ctrly = midy + toC.y*depth;

      const flicker = reduceMotion ? 0.12 : 0.06 + 0.09*Math.abs(Math.sin(t*0.0002 + idx));
      ctx.beginPath();
      ctx.strokeStyle = `rgba(139,127,255,${flicker.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.moveTo(p1.x,p1.y);
      ctx.quadraticCurveTo(ctrlx,ctrly,p2.x,p2.y);
      ctx.stroke();
    });

    if(!reduceMotion) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
