$(window).load(function(){
 
/* calling the isotope plugin */
    var $container = $('.portfolio');
    $container.isotope({
        filter: '*',
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false,
        }
    });

    $('nav.portfoliofilter ul a').click(function(){
        var selector = $(this).attr('data-filter');
        $container.isotope({
            filter: selector,
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false,
            }
        });
      return false;
    });

    var $optionSets = $('nav.portfoliofilter ul'),
       $optionLinks = $optionSets.find('a');
  
       $optionLinks.click(function(){
          var $this = $(this);
      // don't proceed if already selected
      if ( $this.hasClass('selected') ) {
          return false;
      }
   var $optionSet = $this.parents('nav.portfoliofilter ul');
   $optionSet.find('.selected').removeClass('selected');
   $this.addClass('selected'); 
});

});



$(document).ready(function(){

    /* calling the pretty photo plugin */
    $("a[rel^='prettyPhoto']").prettyPhoto({
    	social_tools:''
    });

    /* the wedding page toggle */
    $('.seemore').hide();
          $('.participant-details .readmore').click(function() {
           $(this).prev('.seemore').slideToggle('slow');
           return true;
    });

    /* the gallery image overlay */  
    $('.portfolio figure.entry').hover(function () {
        $(this).find('.image-overlay-bg').stop(true, true).animate({opacity: 0.6}, 300 );      
      }, function () {
        $(this).find('.image-overlay-bg').stop(true, true).animate({opacity: 0}, 300 );
      }
    );

    $(".portfolio figure.entry a").append("<span class='image-overlay-bg'></span>");
    
  });



