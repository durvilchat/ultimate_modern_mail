odoo.define('mail_modern.thread', function (require) {
    "use strict";
    var core = require('web.core');
    var QWeb = core.qweb;
    var thread = require('mail.ChatThread');
    var time = require('web.time');

    var
        _t = core._t;

    var ORDER = {
        ASC: 1,
        DESC: -1,
    };

    function time_from_now(date) {
        if (moment().diff(date, 'seconds') < 45) {
            return _t("now");
        }
        return date.fromNow();
    }


    thread.include({

        className: 'o_mail_thread',

        events: {
            "click a": "on_click_redirect",
            "click img": "on_click_redirect",
            "click strong": "on_click_redirect",
            "click .o_thread_show_more": "on_click_show_more",
            "click .o_attachment_download": "_onAttachmentDownload",
            "click .o_attachment_view": "_onAttachmentView",
            "click .o_thread_message_needaction": function (event) {
                var message_id = $(event.currentTarget).data('message-id');
                this.trigger("mark_as_read", message_id);
            },
            "click .o_thread_message_star": function (event) {
                var message_id = $(event.currentTarget).data('message-id');
                this.trigger("toggle_star_status", message_id);
            },
            "click .o_thread_message_reply": function (event) {
                this.selected_id = $(event.currentTarget).data('message-id');
                this.$('.o_thread_message').removeClass('o_thread_selected_message');
                this.$('.o_thread_message[data-message-id="' + this.selected_id + '"]')
                    .addClass('o_thread_selected_message');
                this.trigger('select_message', this.selected_id);
                event.stopPropagation();
            },
             "click .coll .o_thread_message_core": function (event) {
                event.preventDefault();
                var itemSelect = $(event.currentTarget).find(".o_thread_message_sidebar_small");
                if (itemSelect.hasClass("hide"))
                    itemSelect.removeClass('hide');
                else
                    itemSelect.addClass('hide');
            },
            "click .o_editemessage": function (event) {
                this.selected_id = $(event.currentTarget).data('message-id');
                this.$('.o_thread_message').removeClass('o_thread_selected_message');
                this.$('.o_thread_message[data-message-id="' + this.selected_id + '"]')
                    .addClass('o_thread_selected_message');
                this.trigger('select_message_edit', this.selected_id);
                event.stopPropagation();
            },
            "click .oe_mail_expand": function (event) {
                event.preventDefault();
                var $message = $(event.currentTarget).parents('.o_thread_message');
                $message.addClass('o_message_expanded');
                this.expanded_msg_ids.push($message.data('message-id'));
            },
            "click .o_thread_message": function (event) {
                $(event.currentTarget).toggleClass('o_thread_selected_message');
            },
            "click .o_thread_detete": function (event) {
                var message_id = $(event.currentTarget).data('message-id');
                var userselection = confirm(_t("Do you really want to delete this message?"));

                if (userselection == true) {
                    this.trigger("delete_message", message_id);
                }
                else {

                }
            },
            "click": function () {
                if (this.selected_id) {
                    this.unselect();
                    this.trigger('unselect_message');
                }
            },
        },

        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.options = _.defaults(options || {}, {
                display_order: ORDER.ASC,
                display_needactions: true,
                display_stars: true,
                display_document_link: true,
                display_avatar: true,
                squash_close_messages: true,
                display_email_icon: true,
                display_reply_icon: false,
            });
            this.expanded_msg_ids = [];
            this.selected_id = null;
        },

        render: function (messages, options) {
            var self = this;
            var msgs = _.map(messages, this._preprocess_message.bind(this));
            if (this.options.display_order === ORDER.DESC) {
                msgs.reverse();
            }
            options = _.extend({}, this.options, options);

            // Hide avatar and info of a message if that message and the previous
            // one are both comments wrote by the same author at the same minute
            // and in the same document (users can now post message in documents
            // directly from a channel that follows it)
            var prev_msg;
            _.each(msgs, function (msg) {
                if (!prev_msg || (Math.abs(msg.date.diff(prev_msg.date)) > 60000) ||
                    prev_msg.message_type !== 'comment' || msg.message_type !== 'comment' ||
                    (prev_msg.author_id[0] !== msg.author_id[0]) || prev_msg.model !== msg.model ||
                    prev_msg.res_id !== msg.res_id) {
                    msg.display_author = true;
                } else {
                    msg.display_author = !options.squash_close_messages;
                }
                prev_msg = msg;
            });

            this.$el.html(QWeb.render('mail.ChatThread', {
                messages: msgs,
                options: options,
                ORDER: ORDER,
                date_format: time.getLangDatetimeFormat(),
            }));

            this.attachments = _.uniq(_.flatten(_.map(messages, 'attachment_ids')));

            _.each(msgs, function (msg) {
                var $msg = self.$('.o_thread_message[data-message-id="' + msg.id + '"]');
                $msg.find('.o_mail_timestamp').data('date', msg.date);

                self.insert_read_more($msg);
            });

            if (!this.update_timestamps_interval) {
                this.update_timestamps_interval = setInterval(function () {
                    self.update_timestamps();
                }, 1000 * 60);
            }
        },
        _preprocess_message: function (message) {
            var msg = _.extend({}, message);
            msg.date = moment.min(msg.date, moment());
            msg.hour = time_from_now(msg.date);

            var date = msg.date.format('YYYY-MM-DD');
            if (date === moment().format('YYYY-MM-DD')) {
                msg.day = _t("Today");
            } else if (date === moment().subtract(1, 'days').format('YYYY-MM-DD')) {
                msg.day = _t("Yesterday");
            } else {
                msg.day = msg.date.format('LL');
            }

            if (_.contains(this.expanded_msg_ids, message.id)) {
                msg.expanded = true;
            }

            msg.display_subject = message.subject && message.message_type !== 'notification' && !(message.model && (message.model !== 'mail.channel'));
            msg.is_selected = msg.id === this.selected_id;
            return msg;
        },
        /**
         * Removes a message and re-renders the thread
         * @param {int} [message_id] the id of the removed message
         * @param {array} [messages] the list of messages to display, without the removed one
         * @param {object} [options] options for the thread rendering
         */
        remove_message_and_render: function (message_id, messages, options) {
            var self = this;
            var done = $.Deferred();
            this.$('.o_thread_message[data-message-id="' + message_id + '"]').fadeOut({
                done: function () {
                    self.render(messages, options);
                    done.resolve();
                },
                duration: 200,
            });
            return done;
        },
    });

});