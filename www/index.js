var resetMags;

document.addEventListener('deviceready', function(){
  function playSound(filename){
    var sound = new Media(filename);
    sound.play();
    sound.stop();
    sound.release();
  }
  function reportErr(err){
    navigator.notification.alert(err.message);
  }
  var minmag = Math.Infinity, maxmag;
  
  resetMags = function (){
    minmag = Math.Infinity;
    maxmag = 0;
    playSound("sounds/140867__juskiddink__boing.wav");
  };
  
  resetMags();
  var watchID = navigator.accelerometer.watchAcceleration(
    function(acc){
      var mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z );
      if(mag < minmag){document.getElementById("mmin").textContent;
        minmag = mag;}
      if(mag > maxmag){document.getElementById("mmin").textContent;
        maxmag = mag;}
    },reportErr,{frequency: 50});
}, false);
