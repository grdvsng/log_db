var BasicFilesForm = (function()
{
    function BasicFilesForm(params)
    {
        this.clsName     = "BasicFilesForm";
        this.tag         = "div";
        this.items       = params.items  || [];
        this.innerHTML   = params.label ? "<div class='BasicFilesForm-Label'>" + params.label + "<div>":null;
        this.greed       = null;
        this.format      = params.format || ["Name", "Size", "Change"];
        this.file_input  = params.file_input;
        this.address     = params.address;
        this.term_text   = params.term_text || "X";
        this.submit      = params.submit    || this.generate_submit();
        this.onreadystatechange = params.onreadystatechange || function(){console.log(self.address, '=>', req.status); };
        this.max_files   = params.max_files || 500;
        
        if (this.address) this.submit.listeners = (this.submit.listeners || []).concat([this.generate_submit_action()]);
    }

    BasicFilesForm.prototype.generate_submit_action = function()
    {
        var self = this;

        return {
            event: 'click',
            action: async function()
            {
                var req      = new XMLHttpRequest(),
                    formData = new FormData();
                self.file_input.dom.style.display = 'none'; 
                req.onreadystatechange            = function() 
                { 
                    if (req.status != 0) 
                    {
                        self.file_input.dom.style.display = 'inline';

                        self.file_input.clear_files();
                        self.update_files();
                        self.onreadystatechange(req); 
                    }
                };

                formData.append(self.submit.name, (self.max_files > 1) ? self.file_input.files:self.file_input.files[0]);                                
                req.open("POST", self.address);
                req.send(formData);
            }
        }
    }

    BasicFilesForm.prototype.generate_terminator = function(id, file_name, file_size)
    {
        var el = '<p class="BasicFilesForm-term" onclick="'                                                    +
                  'var elem = document.getElementById(\'' + id + '\'); var parent = elem.parentNode.getEl(); ' + 
                  'parent.master.getEl().remove_file(\'' + file_name + '\', \'' + file_size + '\');">'         + 
                  this.term_text + "</p>";
        
        return el; 
    }

    BasicFilesForm.prototype.render = async function()
    {
        this.master.appendChild(this.dom);
        
        this.greed                    = await MINIBASE.createElement({cls: "BasicGreed", format: this.format, prefill: [["-", "-", ""]]}, this.dom);
        this.file_input               = await MINIBASE.createElement(this.file_input, this.dom);
        this.submit                   = await MINIBASE.createElement(this.submit, this.dom);
        this.submit.dom.style.display = 'none';
    }

    BasicFilesForm.prototype.generate_submit = function()
    {
        return {
            cls: "BasicButton",
            innerHTML: "SEND",
        };
    }

    BasicFilesForm.prototype.remove_file = function(file_name, file_size)
    {
        this.file_input.files = this.file_input.files.filter(function(el)
        {
            return el.name != file_name && el.size != file_size;
        });
        
        this.update_files();
    }

    BasicFilesForm.prototype.update_files = function(self)
    {
        var self = self || this;
        var files = self.file_input.files;

        self.greed.clearRows();

        for (var i=0; i < files.length; i++)
        {
            var file = files[i];
            var id   = file.name + "-" + ((new Date()).getMilliseconds() * file.size);
            var row  = self.greed.generateRow([file.name, bytesToSize(file.size), self.generate_terminator(id, file.name, file.size)]);
            row.id   = id;
            
            self.greed.dom.appendChild(row);
        }

        self.submit.dom.style.display     = (self.file_input.files.length < 1) ? 'none':'inline';
        self.file_input.dom.style.display = (files.length == this.max_files)    ? 'none':'inline';

        if (files.length == 0)  self.greed.dom.appendChild(self.greed.generateRow(["-", "-", ""]));
    }

    return BasicFilesForm;
})();