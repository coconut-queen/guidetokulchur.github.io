$(document).ready( function() {

  $(".navbar-nav li.active").parents('li').toggleClass("active");
  $('.isotope-list').isotope({
    itemSelector: '.list-group-item',
    // masonry: {
    //   columnWidth: 300
    // }
  });
});
