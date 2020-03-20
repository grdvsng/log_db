/**
 * MultiBrowser addEventListener
 * @interface
 * @param {HTMLElement} element - element where connect
 * @param {String} event - event for handle
 * @param {Function} action - function on handle
 *
 */
function _addEventListener(element, event, action)
{
	if ((typeof action) !== 'string')
	{
        if (element.addEventListener)
        {
            element.addEventListener(event, action);
        } else {
            element.attachEvent(event, action);
        }
	} else {
		element['on' + event] = function(){eval(action)};
	}
}

function bytesToSize(bytes) 
{
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0) return 'n/a';
    
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    
    if (i === 0) return bytes + " " + sizes[i];
    
    return (bytes / (1024 ** i)).toFixed(1) + " " + sizes[i];
}

function getScrollPositionByCSS1Support(isCSS1Compat)
{
    var xy = {};

    if (isCSS1Compat)
    {
        xy.x = document.documentElement.scrollLeft;
        xy.y = document.documentElement.scrollTop;
    } else {
        xy.x = document.body.scrollLeft;
        xy.y = document.body.scrollTop;
    }

    return xy;
}

function getScrollPosition()
{
    var xy = {};

    if (window.pageXOffset || false)
    {
        xy.x = window.pageXOffset;
        xy.y = window.pageYOffset;
    } else {
        xy = getScrollPositionByCSS1Support(document.compatMode === "CSS1Compat")
    }

    return xy;
}

function getScrollYPosition()
{
    return getScrollPosition().y;
}

function isScrolledIntoView(elem)
{
    var elemBottom = elem.getBoundingClientRect().bottom;
    
    return elemBottom > 0;
}

function setElemTopLikeScrollY(elem, x)
{
    setTimeout(function() 
    {
        var InEl   = elem.getEl();
            clone  = InEl.setClone(),
            height = elem.getBoundingClientRect().height;

        clone.style.position = "absolute";
        clone.style.top      = getScrollYPosition() + (x || 0);

        if (isScrolledIntoView(elem)) 
        {
            InEl.rmClone()
        }
    }, 350);
}

function keepTrackOfTheScrollY(elem, x)
{
    var action = function()
        {
            setElemTopLikeScrollY(elem, x || 0);
        }

    _addEventListener(window, 'scroll', action);
}

function MakeElemsBlurredBesides(exec)
{
    var engine = exec.getEl().Engine;
    
    console.log(engine.elements.length);
}

function waitWhenFalse(varible, after)
{
    if (varible)
    {
        setTimeout(function()
        {
            console.log("GUI busy...")
            waitWhenFalse(varible);
        }, 1000)
    } else {
        after();
    }
}


/**
 * MultiBrowser String formating
 * @function
 * @param {String} str - string to format
 * @param {Array<String>} args - args to push on string
 * @returns {string}
 *
 */
function format(str, args)
{
    var toFormat   = ((typeof args) !== "string") ? args:[args],
        currentLine = str;

    for (var n in toFormat)
    {
        var key = "\\{" + n + "\\}";
        currentLine = currentLine.replace(new RegExp(key, 'g'), toFormat[n]);
    }

    return currentLine;
}

function cloneArray(obj)
{
    var clone = [];

    for (var n=0; n < obj.length; n++)
    {
        var val = obj[n];

        if (val.constructor.name === 'Object')
        {
            clone.push(cloneObject(val));
        } else if (val.constructor.name === 'Array') {
            clone.push(cloneArray(val));
        } else {
            clone.push(val);
        }
    }

    return clone;
}

function cloneObject(obj)
{
    var clone = {};

    for (var prop in obj)
    {
        var val = obj[prop];

        if (val.constructor.name === 'Object')
        {
            clone[prop] = cloneObject(val);
        } else if (val.constructor.name === 'Array') {
            clone[prop] = cloneArray(val);
        } else {
            clone[prop] = val;
        }
    }

    return clone;
}