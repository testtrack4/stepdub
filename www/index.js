/*global Media*/

"use strict";

var resetMags, setSay, playSound;

document.addEventListener('deviceready', function(){
  function reportErr(err){
    console.log(err);
    navigator.notification.alert(err.message);
  }

  function getBaseName(){
    var pn = window.location.pathname;
    return pn.slice(0,pn.lastIndexOf('/')+1);
  }

  playSound = function(filename){
    var sound = new Media(getBaseName()+filename,
      function onSuccess(){sound.release();});
    sound.play();
  };

  var minmag, maxmag, gravg, frame;
  var gravbacklog = 15;

  resetMags = function (){
    minmag = Infinity;
    maxmag = 0;
    gravg = 0;
    frame = 0;
    document.getElementById("mgra").textContent = '';
  };

  resetMags();
  var watchID = navigator.accelerometer.watchAcceleration(
    function(acc){
      var mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z );
      if(mag < minmag){
        document.getElementById("mmin").textContent = minmag = mag;}
      if(mag > maxmag){
        document.getElementById("mmax").textContent = maxmag = mag;}
      document.getElementById("mcur").textContent = mag;

      frame++;
      gravg = (gravg + mag) / frame;

      var gravlines = document.getElementById("mgra").textContent.split('\n');
      gravlines.push(gravg);
      document.getElementById("mgra").textContent = gravlines
        .slice(-gravbacklog).join('\n');

    },reportErr,{frequency: 50});

document.getElementById("appname").textContent = 'Reset stats';
}, false);
