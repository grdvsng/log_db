var BasicDataForm = (function()
{
    function BasicDataForm(params)
    {
        this.clsName    = "BasicDataForm";
        this.tag        = "form";
        this.items      = [];
        this.fields     = params.fields  || [];
        this.innerHTML  = params.label ? "<div class='BasicDataForm-Label'>" + params.label + "<div>":null;

        this.buildFields();

        if (params.submit) this.items.push(this.setSubmit(params.submit));
    }

    BasicDataForm.prototype.clear = function()
    {
        for (var n=0; n < this.fields.length; n++)
        {
            this.fields[n].value = "";
        }
    }

    BasicDataForm.prototype.checkRequired = function()
    {
        var fields = this.fields;

        for (var n=0; n < fields.length; n++)
        {
            var field = fields[n].getEl();

            fields[n].dispatchEvent(new Event('keyup'));

            if (field.onValid)
            {
                field.onValid.render(fields[n], true);

                return false;
            }
        }

        return true;
    }

    BasicDataForm.prototype.setOnsubmit = function(onsubmit)
    {
        var self = this;

        return function()
        {
            if (self.checkRequired())
            {
                return onsubmit(self);
            }
        }
    }

    BasicDataForm.prototype.setSubmit = function(submit)
    {
        submit.properties = submit.properties || [];
        submit.listeners  = submit.listeners  || [];

        submit.listeners.push({
            event: "click",
            action: this.setOnsubmit(submit.onSubmit)
        });

        return submit;
    }

    BasicDataForm.prototype.getData = function()
    {
        var data = [];

        for (var n=0; n < this.fields.length; n++)
        {
            data.push({
                "name": this.fields[n].name,
                "value": this.fields[n].value,
            })
        }

        return data;
    }

    BasicDataForm.prototype._getTrueFields = function()
    {
        this.fields = this.dom.getElementsByTagName("input");
    }

    BasicDataForm.prototype.render = function()
    {
        this.dom.setAttribute("novalidate", true);

        MINIBASE.connectListeners(this.dom, [{event: "submit", action: PREVENT_DEFAULT}])
        MINIBASE.renderElement(this);

        this._getTrueFields();
    }

    BasicDataForm.prototype.getFieldType = function(field)
    {
        if (field.type === "text")
        {
            return "BasicTextInput";
        } else {
            return null;
        }
    }

    BasicDataForm.prototype.getValidator = function(field)
    {
        return [{
            "re": field.re,
            "msg": field.msg,
            "type": "Error",
            "only_call": true
        }];
    }

    BasicDataForm.prototype.getProperties = function(field)
    {
        var props = [];

        for (var att in field)
        {
            if (att !== "label" && att !== "msg" && att !== "re")
            {
                props.push({
                    name: att,
                    value: field[att]
                })
            }
        }

        return props;
    }

    BasicDataForm.prototype.buildFields = function()
    {
        for (var n=0; n < this.fields.length; n++)
        {
            var field = this.fields[n];

            field.type = field.type || "text";

            this.fields[n] =
            {
                cls: this.getFieldType(field),
                label: field.label,
                properties: this.getProperties(field),
                validators: this.getValidator(field),
                minlength: field.minlength
            }

            this.items.push(this.fields[n]);
        }
    }

    return BasicDataForm;
})();