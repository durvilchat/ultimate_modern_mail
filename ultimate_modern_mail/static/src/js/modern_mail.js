odoo.define('mail_modern.modern_mail', function (require) {
    "use strict";
    var core = require('web.core');
    var Widget = require('web.Widget');
    var QWeb = core.qweb;
    var _t = core._t;
    var hr_attendance = require('hr_attendance.my_attendances');
    var greeting_message = require('hr_attendance.greeting_message');

    hr_attendance.include({
        start: function () {
            var self = this;
            this.motif_list = [];
            this.selected_motif = 0;

        },
        update_attendance: function () {
            var self = this;
            var motif_id = this.selected_motif;
            var motif = $('#motif').val();
            if (motif_id){
                this._rpc({
                        model: 'hr.employee',
                        method: 'attendance_manual',
                        args: [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances'],
                    })
                    .then(function(result) {
                        if (result.action) {
                            var emp_id = result.action.attendance.employee_id[0]
                            var id = result.action.attendance['id'];
                            self._rpc({
                                model: 'hr.attendance',
                                method: 'add_employee_motif',
                                args: [[id],motif_id, motif,emp_id],
                            },{async: false})
                            self.do_action(result.action);
                        } else if (result.warning) {
                            self.do_warn(result.warning);
                        }
                    });
            }else{
                if (typeof($(document).find('#motif').html()) != "undefined" ){
                    $('#motif').css('border','1px solid red');
                }else{
                    self._super();
                }
            }
        },
    });

    greeting_message.include({

        init: function (parent, action) {
            var self = this;
            this._super.apply(this, arguments);
            this.activeBarcode = true;
            console.log("Action sur le clic",action.attendance);
            /*console.log(action.attendance);
            if (!action.attendance) {
                this.activeBarcode = false;
                this.getSession().user_has_group('hr_attendance.group_hr_attendance_user').then(function (has_group) {
                    if (has_group) {
                        self.next_action = 'hr_attendance.hr_attendance_action_kiosk_mode';
                    } else {
                        self.next_action = 'hr_attendance.hr_attendance_action_my_attendances';
                    }
                });
                return;
            }
*/
            this.next_action = action.next_action || 'hr_attendance.hr_attendance_action_my_attendances';
            // no listening to barcode scans if we aren't coming from the kiosk mode (and thus not going back to it with next_action)
            if (this.next_action != 'hr_attendance.hr_attendance_action_kiosk_mode' && this.next_action.tag != 'hr_attendance_kiosk_mode') {
                this.activeBarcode = false;
            }
            this.attendance = action.attendance;
            // check in/out times displayed in the greeting message template.
            this.attendance.check_in_time = (new Date((new Date(this.attendance.check_in)).valueOf() - (new Date()).getTimezoneOffset() * 60 * 1000)).toTimeString().slice(0, 8);
            this.attendance.check_out_time = this.attendance.check_out && (new Date((new Date(this.attendance.check_out)).valueOf() - (new Date()).getTimezoneOffset() * 60 * 1000)).toTimeString().slice(0, 8);
            this.previous_attendance_change_date = action.previous_attendance_change_date;
            this.employee_name = action.employee_name;
        },
    });
});
