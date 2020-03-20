/**
 * BasicButton - basic button
 * @class
 * @extends InnerElement
 */
var BasicButton = (function()
{
    /**
     * Basic Button constructor
     * @constructor
     * @param {InnerElement} params - params for exemplar
     */
    function BasicButton(params)
    {
        this.clsName   = "BasicButton";
        this.items     = params.items;
        this.tag       = "button";
        this.innerHTML = params.innerHTML;
    }

    return BasicButton;
})();