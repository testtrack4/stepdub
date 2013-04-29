/*global Media*/

"use strict";

var paramDefaults = {
  spikeTrigger: 4, dipTrigger: -4,
  spikeStrongest: 10, dipStrongest: -7,
  decayFactor: 0.25,
  sleepThreshold: 1, sleepPeriod: 300,
  sleepInterval: 500,
  wakeInterval: 50
};

function getParam(name){
  return localStorage.getItem(name) === null ? paramDefaults[name] :
    parseFloat(localStorage.getItem(name));
}

function reportErr(err) {
  console.log(err);
  navigator.notification.alert(err.message);
}
function reportTrace(title){
  return function reporter(err) {
    console.log(err,title);
    navigator.notification.alert(err.message,null,title);
  };
}

function getAppLocalBase() {
  var pn = window.location.pathname;
  return pn.slice(0,pn.lastIndexOf('/')+1);
}

function playSound(filename) {
  var sound = new Media(getAppLocalBase()+filename,
    function onSuccess(){sound.release();});
  sound.play();
}

function magAvgListener(options) {
  var abs = Math.abs,
      max = Math.max,
      min = Math.min,
      sqrt = Math.sqrt,
      floor = Math.floor;

  options = options || {};
  var cb = options.cb;
  var maglist = [];
  var order = [];
  var frequency = options.frequency || getParam("wakeInterval");
  var sleepFrequency = options.sleepFrequency || getParam("sleepInterval");
  var sleepPeriod = options.sleepPeriod || getParam("sleepPeriod");
  var samples = options.samples || 127;
  var meandian = options.meandian || 5;
  var sleepiness = options.sleepiness || getParam("sleepThreshold");

  //it's almost like a "this" object!
  var dis = {};

  dis.setCb = function(newcb) {
    cb = newcb;
  };

  dis.setSamples = function(newsamples) {
    samples = newsamples;
    //If we now have too many items in the order list,
    //just reset it and it will regenerate next watch interval
    if (order.length > samples) order = [];
  };

  dis.setMeandian = function(newm) {
    meandian = newm;
  };

  dis.reset = function() {
    maglist = [];
    order = [];
  };

  var lastX = 0;
  var lastY = 0;
  var lastZ = 0;
  var sleepyFrames = 0;

  function watcher(acc) {
    if (abs(lastX-acc.x) + abs(lastY-acc.y) + abs(lastZ-acc.z) > sleepiness){
      if(sleepyFrames >= sleepPeriod){
        navigator.accelerometer.clearWatch(dis.watchID);
        dis.watchID = navigator.accelerometer.watchAcceleration(
          watcher,reportTrace("Wake error"),{frequency: frequency});
      }
      lastX=acc.x; lastY=acc.y; lastZ=acc.z; sleepyFrames = 0;
    } else {
      sleepyFrames++;
      if(sleepyFrames == sleepPeriod){
        navigator.accelerometer.clearWatch(dis.watchID);
        dis.watchID = navigator.accelerometer.watchAcceleration(
          watcher,reportTrace("Sleep error"),{frequency: sleepFrequency});
      }
    }

    var mag = sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z );
    maglist.push(mag);
    while(maglist.length > samples) maglist.shift();
    while(order.length < maglist.length) order[order.length] = order.length;
    order.sort(function(a,b){return maglist[a] - maglist[b];});

    var gravg = 0;
    var rangeStart = max(0, floor(order.length / 2 - meandian / 2));
    var rangeEnd = min(order.length, floor(order.length / 2 + meandian / 2));
    for (var i = rangeStart; i < rangeEnd; i++){
      gravg += maglist[order[i]];
    }

    gravg /= (rangeEnd - rangeStart);

    if(cb) cb(mag,gravg);
  }

  document.addEventListener('deviceready', function(){
    dis.watchID = navigator.accelerometer.watchAcceleration(
      watcher,reportTrace("Startup error"),{frequency: frequency});
  });

  return dis;
}
