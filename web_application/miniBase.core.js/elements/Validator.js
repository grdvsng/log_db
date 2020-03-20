/**
 * Basic validator
 * @class
 */
var Validator = (function()
{
    function Validator(params, master)
    {
        this.id         = "Validator-" + params.type;
        this.clsName    = "Validator";
        this.message    = params.msg;
        this.re         = params.re;
        this.master     = master;
        this.only_call  = (params.only_call  !== undefined) ? params.only_call:false;
        this.conformity = (params.conformity !== undefined) ? params.conformity:true;
        this.minlength  = (params.minlength  !== undefined) ? params.minlength:0;
    }

    Validator.prototype.generateElement = function(triggerRect)
    {
        var elem = document.createElement("div");

        elem.className   = this.clsName;
        elem.id          = this.id;
        elem.style.top   = triggerRect.bottom + 2.5;
        elem.style.left  = triggerRect.left;
        elem.style.width = triggerRect.width;
        elem.innerHTML   = this.message;

        return elem;
    }

    Validator.prototype.remove = function()
    {
        MINIBASE.removeHTMLElement(document.getElementById(this.id));
        MINIBASE.removeHTMLElement(this.dom);

        this.master.onValid = (this.master.onValid === this) ? false:this.master.onValid;
    }

    Validator.prototype.render = function(trigger, call)
    {
        if (this.master.onValid) this.master.onValid.remove();

        if (call || !this.only_call)
        {
            var rect = trigger.getBoundingClientRect(),
                dom  = this.generateElement(rect);

            this.trigger  = trigger;

            document.body.appendChild(dom);

            this.dom = dom;
        }

        this.master.onValid = this;
    }

    return Validator;
})();