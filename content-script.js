(function($){

var interval = 800;
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
            //console.debug( "set_mute:" + msg  );
        }
    });
}

chrome.extension.sendRequest({ type: 'getKeywords' }, function(response) {
    keywords = response.keywords;
    if( ! keywords ) {
        keywords = "";
    }
    keywords = keywords.split( /\s*,\s*/ );
    for(i in keywords) {
      var k=keywords[i];
      if(k[0] == '/')
            keywords[i] = eval( keywords[i] );
    }
});

function do_match(text) {
    for ( k in keywords ) {
        var keyword = keywords[ k ];
        //console.debug( 'matching:' , keyword , text );
        var r = text.match( keyword ); // XXX: rule here.
        if( r ) {
            return 1;
        }
    }
    return 0;
}

function filter_loaded_plurks() {
    $('.plurk').each(function(i,e) {
        var me = $(this);
        var plurk_id = me.get(0).id.match( /p(\d+)/ )[1];
        var text = me.find('.text_holder').html();
        if ( do_match( text ) ) {
            set_mute( plurk_id , 2 );
            //$(this).hide();
            me.html('Muted!!');
            setTimeout(function(){ me.remove() },500);
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
    function pre_filter_plurks() {
        filter_loaded_plurks();
        t = setTimeout( pre_filter_plurks , interval );
    }
    t = setTimeout( pre_filter_plurks , interval );
}, interval );

})(jQuery);
