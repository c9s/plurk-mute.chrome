(function($){

var interval = 1000 * 12;
var user_id;
var t;
var keywords;

console.debug('Plurk-mute Loaded.');

function set_mute(pid,v) {
    $.ajax({
        type: "POST",
        url: "/TimeLine/setMutePlurk",
        data: "plurk_id=" + pid + "&value=" + v,
        success: function(msg){
            console.debug( "setMute:" + msg  );
        }
    });
}

chrome.extension.sendRequest({ type: 'getKeywords' }, function(response) {
    keywords = response.keywords;
    if( ! keywords ) {
        keywords = "";
    }
    keywords = keywords.split( /\s*,\s*/ );
});

function do_match(text) {
    for ( k in keywords ) {
        var keyword = keywords[ k ];
        console.debug( 'matching:' , keyword , text );
        var r = text.match( keyword ); // XXX: rule here.
        if( r ) 
            return 1;
    }
    return 0;
}

function filter_loaded_plurks() {
    $('.plurk').each(function(i,e) {
        var plurk_id = $(this).get(0).id.match( /p(\d+)/ )[1];
        var text = $(this).find('.text_holder').html();
        if ( do_match( text ) ) {
            set_mute( plurk_id , 2 );
            $(this).hide();
        }
    });
}

function get_userid() {
    var result = document.evaluate('//a[contains(@href, "/Friends/showFriendsBasic")]',document, null, 0, null);
    var user_link = result.iterateNext();
    if( user_link ) {
        return user_link.href.match( /user_id=(\d+)/ )[1];
    }
}

// prefech plurks to mute...
setTimeout(function(){
    filter_loaded_plurks();
    user_id = get_userid();

    console.debug( 'keywords:', keywords );

    function pre_filter_plurks() {
        $.ajax({
            type: 'POST',
            url: '/TimeLine/getPlurks',
            data: 'user_id=' + user_id ,
            success : function(res) {
                var plurks = eval(res); // cant use JSON.parse, because of 'new Date'
                console.debug( plurks );
                for( var i=0,p; p = plurks[i] ; i++ ) {
                    if( do_match( p.content_raw ) ) {
                        set_mute(p.id,2);
                    }
                }
            }
        });
        t = setTimeout( pre_filter_plurks , interval );
    }
    t = setTimeout( pre_filter_plurks , interval );
},1000 );

})(jQuery);
