/**
 * 
 * vforms.js
 * Alex Cluff, 2021
 * 
 * https://github.com/Lx1270/html5_vforms
 * 
 * vForms is a versatile and open-source form creation and processing tool.
 * Use it to easily create forms, collect the data and process
 * with it.
 */

var vForm_Object = function(f, submit_callback){

	this.fo_id = "";

	this.submit_callback = null;

	this.body_overflow_o = "initital";

    // whether the form automatically closes when the user submits the form
    // disabling this is useful to validate the data before allowing navigation
    this.close_form_on_submit = true;

	this.submit_form = function(e, self){
		
		// collect form data
		var data = {};

		//$("form", "popupform[interact-data="+self.fo_id+"]").validate();
        var fields = $("form input, form select, form textarea", ".popupform[interact-data="+self.fo_id+"]");

        for(var i = 0; i < fields.length; i++){
            data[$(fields[i]).attr("name")] = $(fields[i]).val();
        }

		
		if(self.close_form_on_submit){
			
			// close out of the form
			// remove darkinator
			$(".darkinator[interact-data="+self.fo_id+"]").remove();
	
			// restore body overflow
			$("body").css("overflow", self.body_overflow_o);
			
			// remove form
			$(".popupform[interact-data="+self.fo_id+"]").remove();
			
		}

		if(typeof self.submit_callback == 'function'){
			self.submit_callback(data, self);
		}
	};

	this.cancel_out_form = function(self){

		// remove darkinator
		$(".darkinator[interact-data="+self.fo_id+"]").remove();

		// restore body overflow
		$("body").css("overflow", self.body_overflow_o);

		SwoopOut(".popupform[interact-data="+self.fo_id+"]", function(){
			
			// remove form
			$(".popupform[interact-data="+self.fo_id+"]").remove();

		});
	};

	this.close_form = function(){
		var self = this;
		SwoopOut(".popupform[interact-data="+self.fo_id+"]", function(){

			// close out of the form
			// remove darkinator
			$(".darkinator[interact-data="+self.fo_id+"]").remove();
			
			// remove form
			$(".popupform[interact-data="+self.fo_id+"]").remove();
			
			// restore body overflow
			$("body").css("overflow", self.body_overflow_o);
		})
	};

	this.AddMessage = function(message_html, className){
		var self = this;

		var html_to_add = $.parseHTML("<span class='inner'>"+message_html+"</span>")
		
		$(".submessage", ".popupform[interact-data="+self.fo_id+"]").empty().append(html_to_add);

		$(".submessage", ".popupform[interact-data="+self.fo_id+"]").attr("class", "submessage hidden");
		$(".submessage", ".popupform[interact-data="+self.fo_id+"]").removeClass("hidden").addClass(className);
	};

	this.return_global_defaultProperties = function(){
		var self = this;
		return {
			label: "New Item",
			editable: true,
			visible: true,
			form_name: "",
			description: ""
		};
	};

	this.return_text_defaultProperties = function(){
		var self = this;
		return self.CombineProperties({
			placeholder: "",
			value: "",
		}, self.return_global_defaultProperties());
	};

	this.return_password_defaultProperties = function(){
		var self = this;
		return self.CombineProperties({
			placeholder: "",
			value: "",
		}, self.return_global_defaultProperties());
	};

	this.return_select_defaultProperties = function(){
		var self = this;
		return self.CombineProperties({
			value: "",
			options: { "Option" : "Value"},
		}, self.return_global_defaultProperties());
	};

	this.return_button_defaultProperties = function(){
		var self = this;
		return self.CombineProperties({
			button_class: "",
			button_text: ""
		}, self.return_global_defaultProperties());
	};

	

	this.create_html = function(f, submit_callback){
		var self = this;
		var default_f = {
			title: "Form Title",
			form_type: "form",
			description: "",
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
		};

		for (const [key, value] of Object.entries(default_f)) {
            if(typeof f[key] == 'undefined'){
                f[key] = value;
            }
        }

		self.close_form_on_submit = f.close_form_on_submit;

		$("body").append("<span class='darkinator "+self.fo_id+"' interact-data='"+self.fo_id+"'></span>");
		var darkinator = $("darkinator")[0];

		$(".darkinator[interact-data="+self.fo_id+"]").click(function(e){
			self.cancel_out_form(self);
		});

		$("body").css("overflow", "hidden");


		$("body").append("<span class='popupform "+self.fo_id+"' interact-data='"+self.fo_id+"'></span>");

		if(f.class !== null){
			if(typeof f.class == 'string'){
				$(".popupform."+self.fo_id).addClass(f.class);
			}
		}

		SwoopIn(".popupform."+self.fo_id);

		$(".popupform."+self.fo_id).append("<span class='title_hold'><span class='title'></span><span class='form_description'></span></span>");

		$(".popupform."+self.fo_id+" .title").text(f.title);
		$(".popupform."+self.fo_id+" .form_description").html(f.description);
		
		$(".popupform."+self.fo_id+"").append("<form action='return false;' class='form_data' id='' name='"+self.fo_id+"'></form>")

		// build input fields
		for(var i = 0; i<f.items.length; i++){
			var inputProp;

			// create our properties array, taking into account our provided properties
			// this allows us to only specify the actual changes we want, while VFORM will
			// apply defaults to any unspecified property.
			switch(f.items[i].type){
				case "text":     inputProp = self.CombineProperties( f.items[i], self.return_text_defaultProperties()); break;
				case "password": inputProp = self.CombineProperties( f.items[i], self.return_password_defaultProperties()); break;
				case "select":   inputProp = self.CombineProperties( f.items[i], self.return_select_defaultProperties()); break;
				case "button":   inputProp = self.CombineProperties( f.items[i], self.return_button_defaultProperties()); break;
				case "something_else": break;
				defualt: return; break;
			}

			var inpobj = $.parseHTML("<span class='form_input_item '></span>");

			// input form name
			var form_name = inputProp.form_name;

			// input class name
			var className = "";

			// input visibility
			if(inputProp.visible == false){
				$(inpobj).addClass("hidden");
			}
			

			

			// input name
			$(inpobj).append("<span class='label '>" + inputProp.label + "</span>");
			
			// input description
			if(typeof inputProp.description !== ""){
				$(inpobj).append("<span class='description '>" + inputProp.description + "</span>");
			}


			if(inputProp.type == "text"){
				// TEXT INPUT FIELD
				var inpHtml = "";
				inpHtml +="<span class='input_hold text'>";
				inpHtml += "<input type='text' placeholder='"+inputProp.placeholder+"' value='"+inputProp.value+"' name='"+inputProp.form_name+"' "+((!inputProp.editable) ? "disabled" : "") + "/>";
				inpHtml += "</span>";

				$(inpobj).append( inpHtml );

			}else if(inputProp.type == "textfield"){
				// TEXT INPUT FIELD
				var inpHtml = "";
				inpHtml +="<span class='input_hold text'>";
				inpHtml += "<textarea placeholder='"+inputProp.placeholder+"' value='"+inputProp.value+"' name='"+inputProp.form_name+"' "+((!inputProp.editable) ? "disabled" : "") +"></textarea>";
				inpHtml += "</span>";

				$(inpobj).append( inpHtml );
			}else if(inputProp.type == "password"){
				// PASSWORD FIELD
				var inpHtml = "";
				inpHtml +="<span class='input_hold password'>";
				inpHtml += "<input type='password' placeholder='"+inputProp.placeholder+"' value='"+inputProp.value+"' name='"+inputProp.form_name+"'  "+((!inputProp.editable) ? "disabled" : "") + "/>";
				inpHtml += "</span>";

				$(inpobj).append( $.parseHTML(inpHtml) );

			}else if(inputProp.type == "select"){
				// SELECT FIELD
				var inpHtml = "";
				inpHtml +="<span class='input_hold select'>";
				inpHtml += "<select name='"+form_name+"'>";
				let data = inputProp.options
				for (var k in data) {
					if (data.hasOwnProperty(k)) {
						if(inputProp.value == data[k]){
							inpHtml += "<option selected value='"+data[k]+"'>"+k+"</span>";
						}else{
							inpHtml += "<option value='"+data[k]+"'>"+k+"</span>";
						}
					 }
				}

				inpHtml += "</select>";
				inpHtml += "</span>";

				$(inpobj).append( $.parseHTML(inpHtml) );
			}else if(inputProp.type == "button"){
				// SELECT FIELD
				var inpHtml = "";
				inpHtml = $.parseHTML("<span class='input_hold button'></span>");

				var button = $.parseHTML("<button class=''></button>");
				$(button).addClass("simple-ui").addClass(inputProp.button_class).text(inputProp.button_text);

				var attrs = inputProp.href_attr;

				for (const property in attrs) {
					$(button).attr(property, attrs[property]);
                    //data += "&" + (`${property}` + "=" + `${form_data[property]}`);
                }
				

				$(inpHtml).append(button)
				$(inpobj).append( inpHtml );
			}
			$(".form_data", ".popupform[interact-data='"+self.fo_id+"']").append(inpobj);
		}

		// form submit and cancel buttons
		var html = "";

		html +="<span class='input_hold submit'>";
		html += "<span class='submessage'></span>"
		if(f.sumit_button){
			html += "<button class='cmdPopupForm_submit blue'>"+f.submit_button_text+"</button>";
		}
		if(f.cancel_button){
			html += "<button class='cmdPopupForm_cancel red'>"+f.cancel_button_text+"</button>";
		}
		html += "</span>";
		$(".popupform."+self.fo_id+"").append(html);

		$(".cmdPopupForm_submit", ".popupform."+self.fo_id+"").click(function(e){
			self.submit_form(e, self);
		});

		$(".cmdPopupForm_cancel", ".popupform."+self.fo_id+"").click(function(e){
			self.cancel_out_form(self);
		});

	};

	this.CombineProperties = function(properties, defaults){
		for (const [key, value] of Object.entries(defaults)) {
			if(typeof properties[key] == 'undefined'){
				properties[key] = value;
			}
		}

		return properties;
	};
	
	this.init = function(self, f, submit_callback){

		// record our current body overflow setting so we
		// can restore it later.
		self.body_overflow_o = $("body").css("overflow");

		// bind our submit callback function
		if(typeof submit_callback == 'function'){
			self.submit_callback = submit_callback;
		}

		self.generateFOID(self);
		self.create_html(f);
	};


	this.CreateFormData = function(form_data){
		var data = "";
		for (const property in form_data) {
			data += "&" + (`${property}` + "=" + `${form_data[property]}`);
		}
		return data.substr(1);
	}

	/**
	* Checks ABN for validity using the published ABN checksum algorithm.
	* @author Guy Carpenter
	* @license http://www.clearwater.com.au/code None
	* @param  {String|Number} value abn to validate
	* @return {Boolean} Is ABN Valid
	*/
	this.validateABN = function(value) {

		var weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
			abn = value.replace(/[^\d]/, ''),
			result = false;

		// check length is 11 digits
		if (abn.length === 11) {

			// apply ato check method
			var sum = 0,
				weight;

			for (var index = 0; index <= weights.length - 1; index++) {
				weight = weights[index];
				digit = abn[index] - (index ? 0 : 1);
				sum += weight * digit;
			}

			result = sum % 89 === 0;
		}

		return result;
	}

	this.generateFOID = function(self){
		// generates a random id for the form and darkinator elements.
		var string  = "";
		var avchars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		for(var i = 0; i<16; i++){
			string += avchars.substr( Math.floor(Math.random()*avchars.length), 1 );
		}
		

		self.fo_id = string;

		return string;
	};

	this.init(this, f, submit_callback);

	return this;
};


var ajax_message = function(settings){


	this.close_message = function(){

	};


	this.init = function(settings){
		var self = this;
		var default_settings = {
			message: "Hello world!",
		};



	}

	this.init(settings);

	return this;
};

function SwoopIn(element, callback){
    $(element).addClass("slide-in").removeClass("hidden");
    setTimeout(function(){
        $(element).removeClass("slide-in");
        if(typeof callback == "function"){ callback(); }
    }, 500);
}

function SwoopOut(element, callback){
    $(element).addClass("slide-out");
    setTimeout(function(){
        $(element).removeClass("slide-out").addClass("hidden");
        if(typeof callback == "function"){ callback(); }
    }, 500);
}