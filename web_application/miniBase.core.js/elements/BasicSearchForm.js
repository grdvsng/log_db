var BasicSearchForm = (function()
{
    function BasicSearchForm(params)
    {
        this.clsName    = "BasicSearchForm";
        this.tag        = "div";
        this.items      = params.items  || [];
        this.innerHTML  = params.label ? "<div class='BasicSearchForm-Label'>" + params.label + "<div>":null;
    }

    return BasicSearchForm;
})();