odoo.define('mail_modern.emojies_class', function (require) {
    "use strict";
    var Class = require('web.Class');
    var emojisdata = require('mail_modern.emojies_data');
    var categories = [
        {name: 'people', label: 'People', emojies: []},
        {name: 'nature', label: 'Nature', emojies: []},
        {name: 'food', label: 'Food', emojies: []},
        {name: 'activity', label: 'Activities', emojies: []},
        {name: 'travel', label: 'Travel & Places', emojies: []},
        {name: 'object', label: 'Objects', emojies: []},
        {name: 'symbol', label: 'Symbols', emojies: []},
        {name: 'flag', label: 'Flags', emojies: []}
    ];

    var defaults = {
        position: 'right',
        fadeTime: 100,
        iconColor: 'black',
        iconBackgroundColor: '#eee',
        recentCount: 36,
        emojiSet: 'apple',
        container: 'body',
        button: true
    };
    var full_emojies = emojisdata.getData();

    function getPickerHTML(emojis) {
        var aliases = {
            'undefined': 'object'
        }
        var items = {};


        // Re-Sort Emoji table
        $.each(emojis, function (i, emoji) {
            var category = aliases[emoji.category] || emoji.category;
            if (category) {
                $.each(categories, function (k, cat) {
                    if (category === cat['name']) {
                        categories[k].emojies.push(emoji)
                    }
                });
            }
        });
    }

    function findEmoji(code) {
        var emojis = full_emojies;
        for (var i = 0; i < emojis.length; i++) {
            if (emojis[i].shortcode == code) {
                return emojis[i];
            }
        }
    }

    function toUnicode(code) {
        var codes = code.split('-').map(function (value, index) {
            return parseInt(value, 16);
        });
        if (isNaN(codes[0])) {
            return
        }
        return String.fromCodePoint.apply(null, codes);
    }


    var Emojis = Class.extend({
        init: function (parent) {
            getPickerHTML(full_emojies);
        },
        getEmojis: function () {
            return categories;
        },
        emojiClicked: function (emojiSpan) {
            var emojiUnicode = toUnicode(findEmoji(emojiSpan).unicode[defaults.emojiSet]);
            return emojiUnicode
        },

    });
    var emojies = new Emojis();

    emojies.init();

    return emojies;
});
