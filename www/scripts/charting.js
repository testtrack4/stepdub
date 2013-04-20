/*global Modernizr*/

function chartable(svg, opts){
  opts = opts || {};
  var samples = opts.samples !== undefined ? opts.samples : 300;
  var frameSec = Modernizr.smil &&
    (opts.frameSec !== undefined ? opts.frameSec : 1/40);
  var initY = opts.initY !== undefined ? opts.initY : 0;
  var defStyle = opts.defStyle !== undefined ? opts.defStyle : "stroke: green";
  var baseTop = opts.baseTop !== undefined ? opts.baseTop : 10;
  var baseBottom = opts.baseBottom !== undefined ? opts.baseBottom : -10;

  var frame = 1;
  var segments = [];
  var values = [];
  var initViewBox = '1 ' + (-baseTop) + ' ' +samples+' '+ (baseTop-baseBottom);

  svg.setAttribute("viewBox",initViewBox);

  for (var i = 0; i < samples+2; i++){
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
    var newViewBox = frame + ' ' + top + ' ' +
      samples + ' ' + (-(top-bottom));
    if(frameSec) {
      var oldViewBox = anim.getAttribute('to');
      anim.setAttribute('to', newViewBox);
      anim.setAttribute('from', oldViewBox || initViewBox);
      anim.beginElement();
    }
    svg.setAttribute("viewBox",newViewBox);
  }

  function addPoint(y,style){
    if(values.length){
      var path = segments[(frame-1)%(samples+2)];
      path.setAttribute('d',"M "+(frame+samples+1)+' '+(-values[(frame-1)%(samples+2)])+
        ' L '+(frame+samples+2)+' '+(-y));
      path.setAttribute('style',style === undefined ? defStyle : style);
      values[frame%(samples+2)]=y;
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
