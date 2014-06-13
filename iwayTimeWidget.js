;(function( $ ) {
    $.widget( "ui.iwayTimeWidget", {
        options: {
            startPositionIndex: 0,
            enabledAlert: false,
            disabled: false,
            inputsName: {
                hourInput: null,
                minutesInput: null
            },
            localization: {'timeAlert': 'Укажите время от 00:00 до 23:59'},
            onChange: function() {}
        },
        hourInput: false,
        minutesInput: false,
        autocomplete: false,
        alertBox: $('<div class="iway-time-arrow-box"><div class="padding"></div></div>'),
        _cacheValue: false,
        _defDataList: [
            "00 : 00",
            "01 : 00",
            "02 : 00",
            "03 : 00",
            "04 : 00",
            "05 : 00",
            "06 : 00",
            "07 : 00",
            "08 : 00",
            "09 : 00",
            "10 : 00",
            "11 : 00",
            "12 : 00",
            "13 : 00",
            "14 : 00",
            "15 : 00",
            "16 : 00",
            "17 : 00",
            "18 : 00",
            "19 : 00",
            "20 : 00",
            "21 : 00",
            "22 : 00",
            "23 : 00"
        ],
        dataList: [],
        getUnixTime: function() {
            return this.hourInput.val()*3600 + this.minutesInput.val()*60;
        },
        getValue: function() {
            var hour = this.hourInput.val(),
                minutes = this.minutesInput.val();
            return {
                hour: hour,
                minutes: minutes,
                stringTime: (!hour || !minutes) ? null :  hour+':'+minutes,
                unixTime: hour*3600 + minutes*60
            }
        },
        setValue: function(hour, minutes) {
            this.hourInput.val(hour);
            this.minutesInput.val(minutes);
            this._defOnChange();
        },
        focus: function() {
            this.hourInput.focus();
        },
        setValWithoutChange: function(val) {
            val = (typeof val == 'undefined' || typeof val != 'string') ? false : val;
            if (val) {
                var splitVal = val.replace(/\s+/g,'').split(':');
                if (splitVal.length !== 2) return false;
                this.hourInput.val(splitVal[0]);
                this.minutesInput.val(splitVal[1]);
                this._validation();
                return val;
            }
            return false;
        },
        val: function(val) {
            val = (typeof val == 'undefined' || typeof val != 'string') ? false : val;

            if (val) {
                var splitVal = val.replace(/\s+/g,'').split(':');
                if (splitVal.length !== 2) return false;
                this.setValue(splitVal[0], splitVal[1]);
                return val;
            }

            var valObj = this.getValue();

            if (!valObj.hour || !valObj.minutes) return null;

            return valObj.hour+':'+valObj.minutes;
        },
        _validation: function() {
            if (this.options.disabled === true) return {'valObj': null, 'isValid': null };
            var self = this,
                valObj = this.getValue(),
                timeString = valObj.hour+':'+valObj.minutes,
                length = timeString.length,
                isValid = this._isTimeValid(timeString);

            if (isValid) {
                this.element.removeClass('iway-time-widget-error');
                self.alertBox.hide();
            } else {

                if (length == 5) {

                    this.element.addClass('iway-time-widget-error');
                    if (self.options.enabledAlert) {
                        var elOffset = this.element.offset(),
                            width = this.element.width();
                        self.alertBox.css({'top':elOffset.top, 'left':elOffset.left + width + 15 }).fadeIn();
                    }

                } else {
                    valObj.hour = (valObj.hour.toString().length == 1) ? '0'+valObj.hour : valObj.hour;
                    valObj.minutes = (valObj.minutes.toString().length == 1) ? '0'+valObj.minutes : valObj.minutes;
                    self.hourInput.val(valObj.hour);
                    self.minutesInput.val(valObj.minutes);
                    return {'valObj': valObj, 'isValid': isValid };
                }
            }

            if (this._cacheValue === valObj) return {'valObj': valObj, 'isValid': isValid };
            this._cacheValue = valObj;
            return {'valObj': valObj, 'isValid': isValid };
        },
        _defOnChange: function() {
            var resValid = this._validation();
            this.options.onChange(this, resValid.valObj, resValid.isValid);
        },
        _isTimeValid: function(time) {
            var result = false;
            ///^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/ allow H and HH
            if (time.match(/^\s*([01]\d|2[0-3]):?([0-5]\d)\s*$/)) {
                result = true;
            }
            return result;
        },
        showMenu: function() {
            if (this.options.disabled === true) return false;
            if ( this.hourInput.autocomplete( "widget" ).is( ":visible" ) ) {
                this.hourInput.autocomplete( "close" );
                return this;
            }
            this.hourInput.autocomplete('search', '');
            return this;
        },
        _create: function() {
            var self = this,
                disabledAttr = this.element.attr( "disabled"),
                elementValue = this.element.text();

            self.dataList = self._defDataList;

            this.element.addClass('iway-time-widget')
                        .data('iwayTimeWidget', self);

            self._render()._setEvents();

            if (!!elementValue) self.val(elementValue);

            if (this.element.hasClass('iway-time-widget-off') || self.options.disabled === true || (typeof disabledAttr !== 'undefined' && disabledAttr !== false)) {
                self.disabled(true);
            }
        },
        disabled: function(boolValue) {
            if (boolValue === true) {
                this.options.disabled = true;
                this.element.addClass('iway-time-widget-off');
                this.hourInput.prop('readonly',true);
                this.minutesInput.prop('readonly',true);
            } else {
                this.options.disabled = false;
                this.element.removeClass('iway-time-widget-off');
                this.hourInput.prop('readonly',false);
                this.minutesInput.prop('readonly',false);
            }
            return this;
        },
        setStartPositionIndex: function(intIndex) {
            var self = this;
            this.options.startPositionIndex = intIndex;

            var postList = [], preList = [];
            $.each(self._defDataList, function(index, item) {
                if (index > self.options.startPositionIndex) {
                    postList.push(item);
                } else {
                    preList.push(item);
                }
                self.dataList = $.merge( $.merge( [], postList ), preList );
            });
            return this;
        },
        getPositionIndex: function() {
            var self = this,
                valObj = this.getValue();
            for (var i = 0; i < self._defDataList.length; i++) {
                var time = self._defDataList[i].replace(/\s+/g,'').split(':');
                if (time[0] === valObj.hour) return i;
            }
            return null;
        },
        _render: function() {

            var self = this,
                hourNameAttr = this.element.attr( "hourName" ),
                minutesNameAttr = this.element.attr( "minutesName" ),
                template = '<input class="iway-time-widget-hour" maxlength="2" autocomplete="off" type="text">\
                            <span class="iway-time-widget-split">:</span>\
                            <input class="iway-time-widget-minutes" maxlength="2" autocomplete="off" type="text">';

            this.alertBox.hide().find('.padding').html(self.options.localization.timeAlert);

            $('body').prepend(this.alertBox);

            this.element.html(template);

            var inputs = this.element.find('input');
            this.hourInput = inputs.eq(0);
            this.minutesInput = inputs.eq(1);

            if (self.options.inputsName.hourInput) {
                self.hourInput.attr('name', self.options.inputsName.hourInput);
            }
            if (self.options.inputsName.minutesInput) {
                self.minutesInput.attr('name', self.options.inputsName.minutesInput);
            }
            if (typeof hourNameAttr !== 'undefined' && hourNameAttr !== false) {
                self.hourInput.attr('name', hourNameAttr);
            }
            if (typeof minutesNameAttr !== 'undefined' && minutesNameAttr !== false) {
                self.minutesInput.attr('name', minutesNameAttr);
            }

            if (self.options.startPositionIndex !== 0) {
                self.setStartPositionIndex(self.options.startPositionIndex);
            }

            this.hourInput.autocomplete({
                delay: 0,
                minLength: 0,
                open: function() {
                    self.autocomplete.menu.element.css({'width':self.element.width() - 8});
                },
                source: function( request, response ) {
                    response($.map($.ui.autocomplete.filter(self.dataList, request.term), function(element, index) {
                        var time = element.replace(/\s+/g,'').split(':');
                        return {
                            label: element,
                            value: time[0],
                            data:  time
                        };
                    }));
                },
                select: function( event, ui ) {
                    self.setValue(ui.item.data[0], ui.item.data[1]);
                    return false;
                },
                change: function( event, ui ) {

                }
            });


            this.autocomplete = this.hourInput.data('autocomplete');

            this.autocomplete.menu.element.addClass('iway-time-widget-autocomplete-menu');
            return this;
        },
        _setEvents: function() {
            var self = this;

            this.element.click(function(){
                self.minutesInput.focus();
                self.showMenu();
                return false;
            });

            this.hourInput.click(function(){
                self.hourInput.focus();
                self.showMenu();
                return false;
            });

            this.minutesInput.click(function(){
                self.minutesInput.focus();
                self.showMenu();
                return false;
            });

            var _validNum = function(evt) {
                if (self.options.disabled === true) return false;
                var charCode = (evt.which) ? evt.which : event.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 58)) return false;
                return true;
            };

            this.hourInput.keypress(_validNum);
            this.minutesInput.keypress(_validNum);

            this.hourInput.keyup(function(e) {
                if (e.which == 8 || e.which == 0 ) return true;
                var str = $(this).val(),
                    n = str.length;

                if (n >= 2) {
                    if (e.which>47 && e.which<58) { // only num
                        self.minutesInput.focus().select();
                    }
                }
            });

            this.minutesInput.keyup(function(e) {
                if (e.which == 8 && $(this).val() == '') { // backspace
                    self.hourInput.focus()
                }
                if (e.which == 8 || e.which == 0 ) return true;
            });

            this.hourInput.change(function() {
                self._defOnChange();
            });

            this.minutesInput.change(function() {
                self._defOnChange();
            });

            this.minutesInput.focusout(function() {
                if ( self.hourInput.autocomplete( "widget" ).is( ":visible" ) ) {
                    self.hourInput.autocomplete( "close" );
                }
            });

            return this;
        },
        destroy: function() {
            $.Widget.prototype.destroy.call( this );
        }
    });
})( jQuery );