module.exports = {
    block: 'page',
    title: 'Photo Effects',
    head: [
        { elem : 'meta', attrs : { name : 'viewport', content : 'initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width' } },
        { elem : 'meta', attrs : { name : 'format-detection', content : 'telephone=no' } },
        { elem : 'meta', attrs : { name : 'msapplication-tap-highlight', content : 'no' } },
        { elem : 'meta', attrs : { name : 'Content-Security-Policy', content : 'default-src * \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; media-src *' } },
        { elem : 'css', url : 'index.min.css' }
    ],
    scripts: [
        { elem : 'js', url : 'cordova.js' },
        { elem : 'js', url : 'index.min.js' }
    ],
    mods: { theme: 'islands'},
    content: []
};
