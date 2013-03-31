/*global Media*/

"use strict";

var resetMags, setSay;

document.addEventListener('deviceready', function(){
  function reportErr(err){
    console.log(err);
    navigator.notification.alert(err.message);
  }

  function getBaseName(){
    var pn = window.location.pathname;
    return pn.slice(0,pn.lastIndexOf('/')+1);
  }

  function playSound(filename){
    var sound = new Media(getBaseName()+filename,
      function onSuccess(){sound.release();});
    sound.play();
  }
  var minmag, maxmag, grest;
  var framesay = 0.5;
  var gravbacklog = 15;

  setSay = function(){
    framesay = parseFloat(document.getElementById("sayval").value);
  };

  resetMags = function (){
    minmag = Infinity;
    maxmag = 0;
    grest = 9.8;
    document.getElementById("mgra").textContent = '';
    playSound("sounds/boing.mp3");
  };

  resetMags();
  var watchID = navigator.accelerometer.watchAcceleration(
    function(acc){
      var mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z );
      grest = grest * (1-framesay) + mag*framesay;
      if(mag < minmag){
        document.getElementById("mmin").textContent = minmag = mag;}
      if(mag > maxmag){
        document.getElementById("mmax").textContent = maxmag = mag;}
      document.getElementById("mcur").textContent = mag;

      var gratc = document.getElementById("mgra").textContent;
      while((gratc.match(/\n/g)||[]).length >= gravbacklog)
        gratc = gratc.replace(/[^\n]*\n/,'');
      document.getElementById("mgra").textContent =
          gratc + grest + '\n';

    },reportErr,{frequency: 50});

document.getElementById("appname").textContent = 'Reset stats';
}, false);
