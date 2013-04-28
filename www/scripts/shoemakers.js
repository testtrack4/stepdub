/*global chartp getParam playSound*/

//// Parameters

//The minimum magnitude to trigger a sound / begin state oscillation.
var sensitivity = getParam("bottomThreshold", 4);
//For shoes with variable intensity, the most intense magnitude.
var topThreshold = getParam("topThreshold", 10);
//For jumping shoes, the least intense magnitude (freefall).
var dipThreshold = getParam("dipThreshold", 1);
//For shoes that play on multiple states:
//The state to play the first sound on.
var firstState = getParam("firstState", 1);
//The state to play the second sound on.
var secondState = getParam("secondState", 2);

//// State machine constructor

function stepMachine(states, trigger, poll) {

  var flipSide;
  var state = 0;

  return function machine(mag, gravity){
    var gmag = mag - gravity;
    if(state == 0) {
      if(gmag > sensitivity){
        state = 1;
        flipSide = gmag;
        trigger && trigger(gmag,state);
      }
    } else if(flipSide > 0 != gmag > 0) {
      state++;
      if (state == states) state = 0;
      flipSide = gmag;
      trigger && trigger(gmag,state, gravity);
    }
    poll && poll(gmag,state,gravity);
  };
}

//// Charting functions

//These all assume "chartp" has been defined outside of this
//context. That is the mechanism I'm choosing for the graph.

var stateColors = [ "green", "white", "yellow" ];
var styleInto = 'stroke:' + stateColors[0];
function chartState (mag, state){
  chartp(mag, styleInto);
  styleInto = 'stroke:' + stateColors[state];
}

//Technically this isn't a shoemaker but it is the machine for ninjas
function chartSilence(mag, grav) {
  chartp(mag - grav, "stroke:gray");
}

//// Machine constructors

function soundTrigger(soundName) {
  return stepMachine(3, function trigger(mag, state){
    if(state == 1) playSound("sounds/" + soundName + '.mp3');
  }, chartState);
}

function doubleSounder(upSound, downSound) {
  return stepMachine(3, function trigger(mag, state){
    if(state == firstState)
      playSound("sounds/" + upSound + '.mp3');
    else if(state == secondState)
      playSound("sounds/" + downSound + '.mp3');
  }, chartState);
}

function gallopIterator(folder, count) {
  var position = 0;
  return stepMachine(3, function trigger(mag, state){
    if(state == firstState || state == secondState)
      playSound("sounds/" + folder + '/' + position + '.mp3');
    position = (position + 1) % count;
  }, chartState);
}

function intenSound(sounds) {
  var max = 0;
  return stepMachine(3, function trigger(mag, state){
    if (state == 2) {
      var i = sounds.length - 1;
      var grade = (topThreshold - sensitivity) / sounds.length - 1;
      while (max < sensitivity + grade * i) i--;
      playSound("sounds/" + sounds[i] + '.mp3');
      max = 0;
    }
  }, function poll(mag, state){
    if (state == 1) max = Math.max(max, mag);
    //TODO: chart the intensity of the step for
    //the duration of state 1
    chartState(mag, state);
  });
}

function jumpIntenSound(sounds) {
  var min = Infinity;
  return stepMachine(3, function trigger(mag, state, gravity){
    if (state == 0) {
      var i = sounds.length - 1;
      var grade = (dipThreshold - gravity) / sounds.length - 1;
      while (min > gravity - grade * i) i--;
      playSound("sounds/" + sounds[Math.max(i,0)] + '.mp3');
      min = Infinity;
    }
  }, function poll(mag, state, gravity){
    if (state == 2) min = Math.min(min, mag + gravity);
    //TODO: chart the intensity of the step for
    //the duration of state 1
    chartState(mag, state);
  });
}
