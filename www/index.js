var resetMags;

document.addEventListener('deviceready', function(){
  function reportErr(err){
    navigator.notification.alert(err.message);
  }
  function playSound(filename){
    try {
      var sound = new Media(filename);
      sound.play();
      sound.stop();
      sound.release();
    } catch(err) {reportErr(err)};
  }
  var minmag = Infinity, maxmag;
  
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
    },reportErr,{frequency: 50});

document.getElementById("appname").textContent = 'reset stats';
}, false);

document.getElementById("appname").textContent = 'script has run';
