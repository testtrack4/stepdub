/*global Media*/

"use strict";

function reportErr(err){
  console.log(err);
  navigator.notification.alert(err.message);
}

function getAppLocalBase(){
  var pn = window.location.pathname;
  return pn.slice(0,pn.lastIndexOf('/')+1);
}

function playSound(filename){
  var sound = new Media(getAppLocalBase()+filename,
    function onSuccess(){sound.release();});
  sound.play();
}