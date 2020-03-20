/**
 * Light engine
 * @author - Trishkin Sergey
 * @module
 */


var ElementCompiler = (function()
{
    function ComponentCompiler(master)
    {
        this.master = master;
    }

    ComponentCompiler.prototype.compileElement = async function(element, master)
    {
        var htmlEl     = await document.createElement(element.tag);
        element.master = master || document.body;

        this.merger(element, htmlEl);

        return new Promise(function(resolve) { resolve(element) });
    }

    ComponentCompiler.prototype.renderElement = function(InnerEl)
    {
        InnerEl.master.appendChild(InnerEl.dom);
    }

    ComponentCompiler.prototype.removeElement = function(InnerEl)
    {
        var _engine = InnerEl.Engine;

        InnerEl.dom.parentNode.removeChild(InnerEl.dom);

        if (_engine)
        {
            _engine.elements = _engine.elements.filter(function(el)
            {
                return el !== InnerEl;
            })
        }
    }

    ComponentCompiler.prototype.clearElementClone = function(elem)
    {
        if (elem.clone)
        {
            if (elem.clone.parentNode) elem.clone.parentNode.removeChild(elem.clone);
        }

        elem.clone = undefined;
    }

    ComponentCompiler.prototype.setElementClone = function(elem)
    {
        this.clearElementClone(elem);

        elem.clone           = elem.dom.cloneNode();
        elem.clone.innerHTML = elem.dom.innerHTML;
        elem.clone.id        = (elem.dom.id || elem.clsName) + "-Clone";

        elem.dom.parentNode.appendChild(elem.clone);
        
        return elem.clone;
    }

    ComponentCompiler.prototype.setElsDefFunctions = function(InnerEl)
    {
        var self = this;
        
        InnerEl.rmClone  = InnerEl.rmClone  || function() { return self.clearElementClone.apply(self, [InnerEl]) };
        InnerEl.setClone = InnerEl.setClone || function() { return self.setElementClone.apply(self, [InnerEl]) };
        InnerEl.render   = InnerEl.render   || function() { self.renderElement(InnerEl)  };
        InnerEl.remove   = InnerEl.render   || function() { self.removeElement(InnerEl)  };
    }
    
    ComponentCompiler.prototype.mergeHTMLAndInnerAttrs = function(InnerEl, htmlEl)
    {
        htmlEl.className   = InnerEl.clsName;
        htmlEl.innerHTML   = (InnerEl.innerHTML) || "";
        htmlEl.getEl       = function(){return InnerEl;};
        InnerEl.dom        = htmlEl;

        this.setElsDefFunctions(InnerEl);
    }

    ComponentCompiler.prototype.merger = function(InnerEl, htmlEl)
    {
        this.mergeHTMLAndInnerAttrs(InnerEl, htmlEl);

        if (InnerEl.properties)
        {
            this.connectProperties(htmlEl, InnerEl.properties);
        }
        if (InnerEl.listeners)
        {
            this.connectListeners(htmlEl, InnerEl.listeners);
        }

        return InnerEl;
    }

    /**
     * Connect inner property on HTMLElement
     * @constructor
     * @param {HTMLElement} element - element where connect properties
     * @param {ElementsPropertiesList} properties
     */
    ComponentCompiler.prototype.connectProperties = function(htmlEl, properties)
    {
        for (var p=0; p < properties.length; p++)
        {
            var prop = properties[p];

            htmlEl.setAttribute(prop.name, prop.value || true);
        }
    }

    /**
     * Connect inner property on HTMLElement
     * @constructor
     * @param {HTMLElement} htmlEl - element where connect properties
     * @param {listener} listeners
     */
    ComponentCompiler.prototype.connectListener = function(htmlEl, listener)
    {
        _addEventListener(htmlEl, listener.event, listener.action);
    }

    /**
     * Connect inner property on HTMLElement
     * @constructor
     * @param {HTMLElement} htmlEl - element where connect properties
     * @param {listenersList} listeners
     */
    ComponentCompiler.prototype.connectListeners = function(htmlEl, listeners)
    {
        for (var l=0; l < listeners.length; l++)
        {
            var listener = listeners[l];

            _addEventListener(htmlEl, listener.event, listener.action)
        }
    }

    return ComponentCompiler;
})()


var HTMLGataway = (function()
{
    function HTMLGataway(master)
    {
        this.master = master;
    }

    HTMLGataway.prototype.connectScript = function(path, _type, master)
    {
        var el     = document.createElement('script'),
            master = master || document.head;

        el.src  = path;
        el.type = _type || "text/javascript";

        master.appendChild(el);

        return el;
    }

    HTMLGataway.prototype.connectTitle = function(text)
    {
        var elem = document.createElement('title');
        elem.innerText = text;

        document.head.appendChild(elem);

        return elem;
    }

    HTMLGataway.prototype.removeHTMLElement = function(dom)
    {
        if (dom)
        {
            var InnerEl = (dom.getEl) ? dom.getEl():null,
                parent  = dom.parentNode;

            if (InnerEl) InnerEl.dom = undefined;
            if (parent)  parent.removeChild(dom);

            delete dom;
        }
    }

    HTMLGataway.prototype.connectStyle = function(path)
    {
        var elem = document.createElement('link');

        elem.href = path;
        elem.type = "text/css";
        elem.rel  = "stylesheet";

        document.head.appendChild(elem);

        return elem;
    }

    HTMLGataway.prototype.connectFavicon = function(path)
    {
        var elem = document.createElement('link');

        elem.rel  = "icon";
        elem.href = path;
        elem.type = "image/x-icon";

        document.head.appendChild(elem);

        return elem;
    }

    HTMLGataway.prototype.createInputField = function(params, clsPref)
    {
        var row = document.createElement("tr"),
            lbl = document.createElement("td"),
            inp = document.createElement("td");
       
        row.className = clsPref + "-Field";
        lbl.innerHTML = "<div>" + params.label + "</div>";
        inp.innerHTML = "<input type='" + params.type + " ' name='" + params.name + "' " + (params.required || "") + " class='" + clsPref + "-Field-Input' >";
        lbl.className = clsPref + "-Field-Label";

        row.appendChild(lbl);
        row.appendChild(inp);
    
        return row;
    }
    
    return HTMLGataway;
})();


var Engine = (function()
{
    function Engine(app)
    {
        this.config     = app;
        this.myDir      = this.getEnginePath();
        this.utillsPath = this.myDir + "/utilities/basic_utilities.js";
        
        __inheritance(this, [new ElementCompiler(this), new HTMLGataway(this)]);

        this.setEngineGlobalVars();
        this.onStart()
    }
    
    Engine.prototype.getEnginePath = function()
    {
        var scripts = document.getElementsByTagName('script');

        for (var n=0; n < scripts.length; n++)
        {
            var spath = scripts[n].src.split('?')[0];

            if (spath.match(/core\.js/gi)) return spath.replace(/\/core\.js$/, "");
        }

        throw new Error("Core file renamed...");
    }

    Engine.prototype.reload = function(removeCash)
    {
        (location) ? location.reload(removeCash):window.location.reload(removeCash);
    }

    Engine.prototype.onStart = function()
    {
        for (var n=0; n < MINIBASE_PRIVATE_FUNCTIONS.length; n++)
        {
            var methodName = MINIBASE_PRIVATE_FUNCTIONS[n];
            
            this[methodName]();
            
            delete this[methodName];
        }
    }
    
    Engine.prototype.setEngineGlobalVars = function()
    {
        for (var key in MINIBASE_ENVS)
        {
            var val = MINIBASE_ENVS[key];
            
            window[key] = (val !== 'miniBase') ? val:this;
        }
    }

    Engine.prototype.setStyle = function()
    {
        var path = this.myDir + "/styles/" + (this.config.style || "default") + ".css";
        
        this.connectStyle(path);
    }

    Engine.prototype.setUserStyles = function()
    {
        var paths = this.config.my_styles || [];

        for (var n=0; n < paths.length; n++)
        {
            var path = this.getPath("../styles/" + paths[n] + ".css");
            
            this.connectStyle(path);
        }
    }

    Engine.prototype.run = function()
    {
        var self = this;

        window.onload = function()
        {
            var page = window[(self.config.index || self.config.pages[0])];
            self.initPage(page);
        }
    }

    Engine.prototype.setPages = function()
    {
        for (var n=0; n < this.config.pages.length; n++)
        {
            var page = this.config.pages[n],
                path = this.getPath("pages/" + page + ".js"),
                elem = this.connectScript(path);

            elem.id = "Page-" + page;
        }
    }

    Engine.prototype.setTitle = function()
    {
        this.connectTitle(this.config.name  || "Test-Page miniBase");
    }

    Engine.prototype.setAppIco = function()
    {
        if (this.config.ico)
        {
            var path = this.getPath(this.config.ico);

            this.connectFavicon(path);
        }
    }

    Engine.prototype.getPath = function(path)
    {
        return this.myDir.replace(/[^/]+$/g, "") + path.replace(/\.\.\//g, "");
    }

    Engine.prototype.setBaseElements = function()
    {
        var elements = this.config.elements || MINIBASE_ALL_ELEMENTS;

        for (var n=0; n < elements.length; n++)
        {
            var path = this.myDir + "/elements/" + elements[n] + ".js",
                elem = this.connectScript(path);

            elem.id = "Element-" + elements[n];
        }
    }

    Engine.prototype.setBaseUttils = function()
    {
        this.connectScript(this.utillsPath);
    }

    Engine.prototype.destroyPageWithoutEffect = function()
    {
        for (var n=0; n < this.elements.length; n++)
        {
            var elem = this.elements[n];

            elem.remove();
        }

        document.body.innerHTML = "";
        document.body.clsName   = "";
        this.page               = undefined;
    }

    Engine.prototype.destroyPage = function(page)
    {
        if (page && page.destroy)
        {
            new BasicDestroyEffects(page.destroy);
        }

        this.destroyPageWithoutEffect(page || this.page);
    }

    Engine.prototype.initPage = async function(page)
    {
        this.elements     = [];
        this.afterRender  = page.onReady || [];
        this.page         = cloneObject((typeof page === 'string') ? window[page]:page);
        this.page.reverse = (this.page.reverse !== undefined) ? this.page.reverse:false;
        document.body.className = this.page.cls;

        await this.createElements(page.items || []);
        this._afterRender(page);
    }

    Engine.prototype.replacePage = function(page)
    {
        var page = (typeof page === 'string') ? window[page]:page;

        this.destroyPage(this.page);
        this.initPage(page);
    }

    Engine.prototype._afterRender = async function()
    {
        for (var n=0; n < this.afterRender.length; n++)
        {
            var schedule = this.afterRender[n];

            await schedule();
        }
    }

    Engine.prototype.createExemplar = function(cls, declElement)
    {
        var exemplar = new cls(declElement);

        exemplar.properties = exemplar.properties || declElement.properties || [];
        exemplar.listeners  = exemplar.listeners  || declElement.listeners  || [];
        exemplar.Engine     = this;

        return exemplar;
    }

    Engine.prototype.createElement = async function(declElement, master)
    {
        var master   = master || document.body,
            cls      = (typeof declElement.cls !== 'string') ? declElement.cls:window[declElement.cls],
            exemplar = this.createExemplar(cls, declElement),
            compiled = await this.compileElement(exemplar, master);

        compiled.render();
        this.elements.push(compiled);

        if (compiled.items) 
        {
            await this.createElements(compiled.items, compiled.dom);
        }

        return new Promise(function(resolve) { resolve(compiled) });
    }

    Engine.prototype.reDom = function(InnerEl, newDom)
    {
        var oldDom = InnerEl.dom;

        newDom.render    = oldDom.render;
        newDom.remove    = oldDom.remove;
        newDom.getEl     = oldDom.getEl;
        newDom.className = InnerEl.clsName;
        oldDom.className = "";

        InnerEl.dom   = newDom;
    }

    Engine.prototype.createElements = async function(elements, master)
    {
        var master = master || document.body;

        if (this.page.reverse) elements.reverse();

        for (var el=0; el < elements.length; el++)
        {
            var elem = elements[el];

           await this.createElement(elem, master);
        }
    }

    Engine.prototype.requestParser = function(xhr, afterResponse)
    {
        return function()
        {
            if (xhr.readyState != 4) return;

            if (xhr.status != 200)
            {
              console.log(xhr.status + ': ' + xhr.statusText);
            } else {
                console.log(xhr.responseText);

                if (afterResponse)
                {
                    afterResponse(xhr);
                }
            }
        }
    }

    Engine.prototype.makeRequest = function(url, method, innerQl, _async, afterResponse)
    {
        var xhr  = new XMLHttpRequest();

        xhr.open(method, url, (_async) ? true:false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(innerQl));

        if (_async)
        {
            xhr.onreadystatechange = this.requestParser(xhr, afterResponse);

            return xhr;
        } else {
            return this.requestParser(xhr, afterResponse)();
        }
    }

    return Engine;
})();


__inheritance = function(child, parrents)
{
    for (var n=0; n < parrents.length; n++) 
    {
        var parrent = parrents[n];

        for (var att in parrent)
        {
            if (!child[att] && att !== "master") child[att] = parrent[att];
        }
    }
}

var MINIBASE_ENVS = 
{
    "miniBase":  "miniBase",
    "minibase":  "miniBase",
    "engine":    "miniBase",
    "Engine":    "miniBase",
    "MINIBASE":  "miniBase",
    "ENGINE":    "miniBase",

    "MINIBASE_PRIVATE_FUNCTIONS": 
    [
        "setBaseUttils",
        "setBaseElements",
        "setAppIco",
        "setStyle",
        "setUserStyles",
        "setTitle",
        "setPages",
        "run"
    ],

    "MAIL_REGEXP": /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    "FULLNAME_REGEXP": /[a-zA-Z ]+/gi,
    "LOGIN_REGEXP":    /^[a-z][a-zA-Z0-9 ]{1,}/gi,
    "PREVENT_DEFAULT": function(e) {e.preventDefault();},

    "MINIBASE_ALL_ELEMENTS":
    [
        "BasicButton",
        "BasicDestroyEffects",
        "BasicFloatingWindow",
        "BasicGreed",
        "BasicHeader",
        "BasicPlate",
        "BasicSearchForm",
        "BasicTextInput",
        "Validator",
        "BasicDataForm",
        "BasicContainer",
        "BasicFileInput",
        "BasicFilesForm",
        "BasicStatusDiv"
    ],

    "MINIMUM_LENGTH_MESSAGE": "Minimum length ${minlength}"
}