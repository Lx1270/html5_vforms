# html5_vforms

A simple form builder in written in JS. Drag and drop implementation.

This currently utilizes jQuery for some functions.

```
var my_form = new vForm_Object(settings, submission callback);

// all settings
var my_form = new vForm_Object({
    title: "Form Title",
    form_type: "form",
    description: "This is the forms description, it appears under the form title.",
    class: null,
    isMessageBox: false,
    sumit_button: true,
    submit_button_text: "Ok",
    cancel_button: true,
    cancel_button_text: "Cancel",
    close_form_on_submit: true,
    items: [],
    darkinator: true,
    href_attr: []
}, function(e){
    // on submit callback
});
```