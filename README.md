Time widget

init:

```
$('.timepicker').iwayTimeWidget({
         startPositionIndex: 4,
         enabledAlert: true,
         inputsName: {
             hourInput: 'HH[]',
             minutesInput: 'MM[]'
         },
         localization : {timeAlert: 'Specify the time from 00:00 to 23:59'},
         onChange: function(self, valObj, isValid) {
             //console.log(self, valObj, isValid);
             var timePickers = $('.timepicker');
             timePickers.not(self.element).eq(0)
                        .data('iwayTimeWidget')
                        .setStartPositionIndex( self.getPositionIndex() );
         }
});
```
