/*global chartp getParam playSound*/

//// Parameters

var decayFactor = getParam("decayFactor");
//The minimum magnitude to trigger a sound / begin a spike.
var spikeTrigger = getParam("spikeTrigger");
//For shoes with variable intensity, the most intense magnitude.
var spikeStrongest = getParam("spikeStrongest");
//The minimum magnitude to trigger a sound / begin a dip.
var dipTrigger = getParam("dipTrigger");
//For jumping shoes, the least intense magnitude (freefall).
var dipStrongest = getParam("dipStrongest");

var spikeUntrigger = spikeTrigger * decayFactor;
var dipUntrigger = dipTrigger * decayFactor;

//// State machine constructor

function stepMachine(start, between, stop, outside, invert) {
  var active = false;
  
  return function machine(mag,grav){
    var gmag = mag - grav;
    var cb;
    if(active){
      if(invert ? gmag < dipUntrigger : gmag > spikeUntrigger) {
        cb = between;
      } else {
        active = false;
        cb = stop;
      }
    } else {
      if(invert ? gmag < dipTrigger : gmag > spikeTrigger){
        active = true;
        cb = start;
      } else {
        cb = outside;
      }
    }
    if (cb) cb(gmag,grav);
  };
}

//// Charting functions

//These all assume "chartp" has been defined outside of this
//context. That is the mechanism I'm choosing for the graph.

var brush;
function chartAs(color) {
  return function (mag) {
    chartp(mag, brush || color);
    brush = 'stroke:' + color;
  };
}

//Technically this isn't a shoemaker but it is the machine for ninjas
function chartSilence(mag, grav) {
  chartp(mag - grav, "stroke:gray");
}

//// Machine constructors

var chartWhite = chartAs('white');
var chartTweener = chartAs('#ff8');
var chartYellow = chartAs('yellow');
var chartGreen = chartAs('green');

function soundTrigger(soundName) {
  return stepMachine(function start(mag) {
    playSound("sounds/" + soundName + '.mp3');
    chartWhite(mag);
  }, chartTweener, chartYellow, chartGreen);
}

function doubleSounder(upSound, downSound) {
  return stepMachine(function start(mag) {
    playSound("sounds/" + upSound + '.mp3');
    chartWhite(mag);
  }, chartTweener, function stop(mag) {
    playSound("sounds/" + upSound + '.mp3');
    chartYellow(mag);
  }, chartGreen);

}

function gallopIterator(folder, count) {
  var position = 0;
  
  function playNext(chartFunction) {
    return function(mag) {
      playSound("sounds/" + folder + '/' + position + '.mp3');
      position = (position + 1) % count;
      chartFunction(mag);
    };
  }
  
  return stepMachine(playNext(chartWhite), chartTweener,
    playNext(chartYellow), chartGreen);
}

function intenSound(sounds, invert) {
  var max;
  return stepMachine(function start(mag){
    max = mag;
    chartWhite(mag);
  }, function between(mag){
    max = (invert ? Math.min : Math.max)(max, mag);
    //TODO: use different colors tochart the intensity of the step
    chartTweener(mag);
  }, function stop(mag) {
    var i = sounds.length - 1;
    var grade = (invert ? dipStrongest - dipTrigger 
      : spikeStrongest - spikeTrigger) / sounds.length - 1;
    while (invert ? max > dipTrigger + grade * i
      : max < spikeTrigger + grade * i) i--;
    playSound("sounds/" + sounds[i] + '.mp3');
  }, chartGreen, invert);
}
