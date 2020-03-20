var BasicContainer = (function()
{
    function BasicContainer(params)
    {
        this.clsName = "BasicContainer";
        this.tag     = "table";
        this.items   = params.items || [];
    }

    return BasicContainer;
})();