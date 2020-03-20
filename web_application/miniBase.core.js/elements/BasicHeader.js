var BasicHeader = (function()
{
    function BasicHeader(params)
    {
        this.clsName     = "BasicHeader";
        this.tag         = "div";
        this.keepScroll  = params.keepScroll || false;
        this.innerHTML   = "<span id='BasicHeader-Label'>" + params.label + "</span>";
    }

    BasicHeader.prototype.render = function()
    {
        var self = this;
        
        if (this.keepScroll) keepTrackOfTheScrollY(self.dom);

        this.master.appendChild(self.dom);
    }


    return BasicHeader;
})();