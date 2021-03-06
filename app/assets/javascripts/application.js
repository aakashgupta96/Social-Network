// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require autocomplete-rails
// require bootstrap
//= require jquery.noty.packaged.min
//= require materialize
// = require materialize-rails-confirm.js
//= require_tree .



$(function(){ $('.carousel.carousel-slider').carousel({full_width: true}); });
$( document ).ready(function(){
    $(".button-collapse").sideNav();
    $('.dropdown-button').dropdown({
      inDuration: 400,
      outDuration: 600,
      constrain_width: true, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    });

  })

  $(window).load(function(){
    $("#cover").fadeOut(500);
});


function onBodyLoad() {

    var toTop = document.getElementById('toTop');
    var id = null;
    var delta;
    var height;

    function scrollToTop() {
        var y = window.scrollY;
        if (y > height / 2) {
            delta = delta + 10;
        } else {
            delta = delta - 10;
            delta = delta < 0 ? 10 : delta;
        }
        y = y - delta;
        y = y > 0 ? y : 0;
        window.scrollTo(0, y);
        if (y === 0) {
            clearInterval(id);
        }
    }

    toTop.addEventListener('click', function(event) {
        delta = 5;
        height = window.scrollY;
        event.preventDefault();
        id = setInterval(scrollToTop, 10);
    });



    var content = document.getElementById("content");
    if (content) {
        content.addEventListener('keyup', function() {
            var length = content.value.length;
            var letters = document.getElementById("letters");
            letters.innerHTML = length;

            if (length > 140) {
                letters.style.color = "red";
            } else {
                letters.style.color = "black";
            }
        });
    }


    // var createTweet = document.getElementById("create_tweet");
    // if (createTweet) {
    //     createTweet
    //     .addEventListener('submit', function(event) {
    //         event.preventDefault();
    //         console.log("tried submitting");
    //         var url = "/create_tweet_json";
    //         var content = document.getElementById("content");
    //         data = {
    //             content: content.value,
    //             random: 12345,
    //         }
    //
    //         if (!content.value || (content.value && content.value.length < 1)) {
    //
    //             noty({ text: "Cannot Create Empty Tweet", theme: "relax", type: 'error', layout: 'topRight' });
    //
    //             return;
    //         }
    //
    //
    //         $.ajax({
    //             url: url,
    //             method: "POST",
    //             data: data,
    //             success: function(result) {
    //                 console.log(result);
    //                 var list = document.getElementById("tweets");
    //                 next_elem = list.firstElementChild;
    //                 var new_elem = document.createElement('div');
    //                 new_elem.innerHTML = result.content;
    //                 list.insertBefore(new_elem, next_elem);
    //             },
    //             error: function(error) {
    //                 console.log(error);
    //                 noty({ text: "Error", theme: "relax", type: 'error', layout: 'topRight' });
    //
    //             }
    //         });
    //
    //     });
    // }


    var like_links = document.querySelectorAll('div.tweet a.tweet_like_link');
    if (like_links) {
        for (var i = 0; i < like_links.length; i++) {
            var link = like_links[i];
            var click_function = function(event) {
                event.preventDefault();
                event.stopPropagation();
                var tweet_id = this.id.slice(6);
                $.ajax({
                    url: '/like_tweet_json',
                    method: "POST",
                    data: { tweet_id: tweet_id },
                    success: function(data) {
                        console.log("tweet_" + data.tweet_id);
                        var element = document.getElementById("tweet_" + data.like.tweet_id);
                        console.log(element);

                        if (data.like_state) {
                            element.innerHTML = "Unlike";
                        } else {
                            element.innerHTML = "Like";
                        }

                    },
                    error: function(error) {

                        noty({ text: "Error", theme: "relax", type: 'error', layout: 'topRight' });

                    }
                });

            };

            link.addEventListener('click', click_function.bind(link));
        }
    };



    var content_loaded = false, notification_shown = false;
    page = 0;
    $(document).on('scroll', function(event) {
        if(window.location.pathname != '/')
            return;
        bh = document.body.offsetHeight;
        wh = $(window).height();
        scrollY = window.pageYOffset;


        if (bh - wh - 20 < scrollY && !content_loaded) {
            console.log("load content");
            content_loaded = true;
            

            url = "/index_tweets";
            page = page + 1  ;
            data = {
                page: page
            };
            if(window.location.pathname == '/' && !notification_shown)
            {
                noty({ text: "Loading Tweets", theme: "relax", timeout: 2000, type: 'warning', layout: 'topRight' });
                notification_shown = true;
            }

            $.ajax({
                url: url,
                method: "POST",
                data: data,
                success: function(result) {
                    content_loaded = false;
                },
                error: function(error) {
                    content_loaded = false;
                    page = page - 1;
                   
                }
            });




        }

    });




}

window.addEventListener("load", function(event) {
    onBodyLoad();
});

function validateImageFiles(inputFile) {
    var maxExceededMessage = "This file exceeds the maximum allowed file size (20 MB)";
    var extErrorMessage = "Only image file with extension: .jpg, .jpeg, .gif or .png is allowed";
    var allowedExtension = ["jpg", "jpeg", "gif", "png"];

    var extName;
    var maxFileSize = $(inputFile).data('max-file-size');
    var sizeExceeded = false;
    var extError = false;

    $.each(inputFile.files, function() {
        if (this.size && maxFileSize && this.size > parseInt(maxFileSize)) {sizeExceeded=true;};
        extName = this.name.split('.').pop();
        if ($.inArray(extName, allowedExtension) == -1) {extError=true;};
    });
    if (sizeExceeded) {
        Materialize.toast(maxExceededMessage, 5000);
        $(inputFile).val('');
    };

    if (extError) {
        Materialize.toast(extErrorMessage, 5000);
        $(inputFile).val('');
    };
};
