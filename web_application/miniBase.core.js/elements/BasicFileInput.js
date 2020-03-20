var BasicFileInput = (function()
{

    function BasicFileInput(params)
    {
        this.listeners        = (params.listeners    || []);
        this._validators      = (params.validators) || [];
        this.validators       = [];
        this.tag              = "button";
        this.clsName          = "BasicFileInput";
        this._label           = params.label || "";
        this.innerHTML        = params.label || "";
        this.file_ready_label = params.file_ready_label || this.innerHTML;
        this.ghost            = this.make_ghost();
        this.files            = [];
        this.table            = null;
    }

    BasicFileInput.prototype.make_ghost = function()
    {
        var elem       = document.createElement('input'),
            self       = this;
        elem.type      = "file";
        elem.className = "ghost-elem";
        elem.onchange  = function() {self.set_files(self)};
       
        this.listeners.push({event: "click", action: function(e) { elem.click(); }});
        document.body.appendChild(elem);

        return elem;
    }

    BasicFileInput.prototype.clear_files = function(self)
    {
        var self         = (this.clsName == "BasicFileInput") ? this:self;
        this.files       = [];
        this.ghost.value = "";
    }

    BasicFileInput.prototype.set_files = function(self)
    {
        var self  = (this.clsName == "BasicFileInput") ? this:self,
            files = new Set();

        if (this.ghost.files.length > 0)
        {
            for (var i=0; i < this.ghost.files.length; i++) files.add(this.ghost.files[i]);

            self.files = Array.from(files);
            if (this.master.getEl().clsName === 'BasicFilesForm' ) this.master.getEl().update_files();
 
            self.dom.innerHTML = self.file_ready_label;
        } else {
            self.dom.innerHTML = self._label;
        }
    }


    return BasicFileInput;
})();