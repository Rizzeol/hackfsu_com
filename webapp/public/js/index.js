$(document).ready(function() {
  $('select').material_select();
});


var confetti = $('.confetti');

for(var i = 0; i < 100; i++) {
  confetti.clone().appendTo(".conf-cont");
}