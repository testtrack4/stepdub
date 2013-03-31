/*global Media*/

"use strict";

var resetMags;

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
    function onSuccess() {
        console.log("playAudio():Audio Success");
    }, reportErr);
    sound.play();
//    sound.stop();
//    sound.release();
  }
  var minmag, maxmag;
  var grest = 9.8;
  var framesay = .05;

  resetMags = function (){
    minmag = Infinity;
    maxmag = 0;
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
      document.getElementById("mgra").textContent+= grest+'\n';
      document.getElementById("mgra").scrollTop =
        document.getElementById("mgra").scrollHeight;
    },reportErr,{frequency: 50});

document.getElementById("appname").textContent = 'Reset stats';
}, false);
