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
    sound.stop();
    sound.release();
  }
  var minmag, maxmag;

  resetMags = function (){
    minmag = Infinity;
    maxmag = 0;
    playSound("sounds/140867__juskiddink__boing.wav");
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
    },reportErr,{frequency: 50});

document.getElementById("appname").textContent = 'Reset stats';
}, false);
