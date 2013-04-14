function chartable(svg, opts){
  var samples = opts.samples !== undefined ? opts.samples : 300;
  //TODO: Modernizr check for SVG animation &&'ed to the beginning
  var frameSec = opts.frameSec !== undefined ? opts.frameSec : 1/50;
  var initY = opts.initY !== undefined ? opts.initY : 10;
  var defStyle = opts.defStyle !== undefined ? opts.defStyle : "stroke: green";
  var baseTop = opts.baseTop !== undefined ? opts.baseTop : 20;
  var baseBottom = opts.baseBottom !== undefined ? opts.baseBottom : 0;

  var frame = samples+1;
  var segments = [];
  var values = [];

  for (var i = 0; i <= samples; i++){
    segments[i] = document.createElementNS(
      'http://www.w3.org/2000/svg', 'path');
    segments[i].setAttribute("style",defStyle);
    svg.appendChild(segments[i]);
    if(initY !== false && initY !== null) {
      segments[i].setAttribute("d","M " + i + " " + (-initY) +
        " L " + (i+1) + " " + (-initY));
      values[i] = initY;
    }
  }

  var anim;
  if(frameSec) {
    anim = document.createElementNS(
      'http://www.w3.org/2000/svg', 'animate');

    anim.setAttribute('attributeName', 'viewBox');
    anim.setAttribute('begin', 'indefinite');
    anim.setAttribute('dur', frameSec+'s');
    anim.setAttribute('fill', 'freeze');
    svg.appendChild(anim);
  }

  function pan(){
    var top = -Math.max(Math.max.apply(null,values),baseTop);
    var bottom = -Math.min(Math.min.apply(null,values), baseBottom);
    var newViewBox = frame-samples + ' ' + top + ' ' + samples + ' '+ (-(top-bottom));
    if(frameSec) {
      var oldViewBox = anim.getAttribute('to');
      anim.setAttribute('to', newViewBox);
      if(oldViewBox) anim.setAttribute('from', oldViewBox);
      anim.beginElement();
    } else {
      svg.setAttribute("viewBox",newViewBox);
    }
  }

  function addPoint(y,style){
    if(values.length){
      var path = segments.shift();
      path.setAttribute('d',"M "+frame+' '+(-values[values.length-1])+
        ' L '+(frame+1)+' '+(-y));
      segments.push(path);
      values.push(y); values.shift();
      frame++;
      pan();
    } else { //late initialization for the non-initY case
      for (var i = 0; i <= samples; i++){
        values[i] = y;
      }
    }
  }

  return addPoint;
}
