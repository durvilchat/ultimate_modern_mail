odoo.define('mail_modern.thread', function (require) {
    "use strict";
    var core = require('web.core');
    var thread = require('mail.ChatThread');

    var
        _t = core._t;


    thread.include({


        events: {
            "click a": "on_click_redirect",
            "click img": "on_click_redirect",
            "click strong": "on_click_redirect",
            "click .o_thread_show_more": "on_click_show_more",
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
            "click .o_thread_detete": function (event) {
                var message_id = $(event.currentTarget).data('message-id');
                var userselection = confirm(_t("Do you really want to delete this message?"));

                if (userselection == true) {
                    this.trigger("delete_message", message_id);
                }
                else {

                }
            }, "click .coll .o_thread_message_core": function (event) {
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
            "click": function () {
                if (this.selected_id) {
                    this.unselect();
                    this.trigger('unselect_message');
                }
            },
        },

    });

});