/**
 * Basic input element
 * @class
 */
var BasicTextInput = (function()
{
    /**
     * BasicTextInput constructor
     * @constructor
     */
    function BasicTextInput(params)
    {
        this.listeners   = params.listeners    || [];
        this._validators = (params.validators) || [];
        this.label       = params.label        || null;
        this.validators  = [];
        this.tag         = "input";
        this.clsName     = "BasicTextInput";

        this._validators.push(this.generateLengthValidator(params));
    }

    BasicTextInput.prototype.generateLengthValidator = function(params)
    {
        var minlength = params.minlength || 0,
            msg       = ((params.minlength_message) ? (params.minlength_message.message || MINIMUM_LENGTH_MESSAGE):MINIMUM_LENGTH_MESSAGE).replace("\$\{minlength\}", minlength);

            return {
                "msg": msg,
                "type": "Error",
                "minlength": minlength,
                "conformity": false
            };
    }

    BasicTextInput.prototype.render = function()
    {
        if (this.label)
        {
            this.generateLabel();
        } else {
            MINIBASE.renderElement(this);
        }

        this.pushValidators(this._validators);
    }

    BasicTextInput.prototype.generateLabel = function()
    {
        var tb = document.createElement("div")
            lb = document.createElement("span");

        tb.className = this.clsName + "-Container";
        lb.className = this.clsName + "-Label";
        lb.innerHTML = this.label;

        tb.appendChild(lb);
        tb.appendChild(this.dom);

        this.master.appendChild(tb);
    }

    BasicTextInput.prototype.pushValidators = function(validators)
    {
        for (v=0; v < validators.length; v++)
        {
            validators[v] = this.pushValidator(validators[v], true);
        }

        this.iterateGenerators();
    }

    BasicTextInput.prototype.iterateGenerators = function()
    {
        var action = this.generateValidate();

        MINIBASE.connectListener(this.dom,
        {
            event: "keyup",
            action: action
        });

        MINIBASE.connectListener(this.dom,
        {
            event: "focus",
            action: action
        });
    }

    BasicTextInput.prototype.generateValidate = function()
    {
        var self = this;

        return function(ev)
        {
            for (var n=0; n < self.validators.length; n++)
            {
                var validator  = self.validators[n],
                    conformity = (validator.re) ? this.value.replace(validator.re, "") === "":true,
                    minlength  = (validator.minlength === 0) ? true:this.value.length >= validator.minlength;

                validator.remove();

                if (!conformity || !minlength)
                {
                    validator.render(this);
                }
            }
        }
    }

    BasicTextInput.prototype.pushValidator = function(validatorParams, massAppend)
    {
        var validator = new Validator(validatorParams, this);

        if (!massAppend) this.iterateGenerators();

        this.validators.push(validator);

        return validator;
    }

    return BasicTextInput;
})();