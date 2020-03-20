var base_browser =
{
    reverse: false,
    cls: "base_browser",
    onReady: [function()
    {
        var table         = document.getElementById("DBGreed").getEl();
        MINIBASE.MAX_SIZE = 100;
        MINIBASE.table    = table;

        if (!MINIBASE.db)
        {
            MINIBASE.makeRequest(
                "/rest/get_base",
                "get",
                null,
                true,
                function(xhr)
                {
                    MINIBASE.db =  MINIBASE.db || JSON.parse(xhr.responseText);
                    
                    if (!MINIBASE.joined) 
                    {
                        MINIBASE.joined = MINIBASE.db.tables[0].records.concat(MINIBASE.db.tables[1].records);
                        MINIBASE.joined.sort(function(a, b)
                        {
                            return a.int_id > b.int_id && a.created > b.created;
                        });

                        for (var i=0; i < MINIBASE.joined.length && i < MINIBASE.MAX_SIZE; i++)
                        {
                            var rec = MINIBASE.joined[i],
                                row = table.generateRow([rec.int_id.match(/.{1,10}/g).join("<br>"), rec.created, rec.str.match(/.{1,10}/g).join("<br>")]);
                            
                            table.dom.appendChild(row);
                        }
                    }
                });
        }
    }],

    items: [{
        cls: "BasicHeader",
        keepScroll: true,
        label: "Log DB",

        properties:
        [{
            "name": "title",
            "value": "Вернуться на главную"
        }],

        listeners:
        [{
            event: "click",
            action: function()
            {
                MINIBASE.replacePage("index_page");
            }
        }]
    }, {
        cls: "BasicPlate",

        items: [{
            cls: "BasicStatusDiv",
            properties: [{"name": "id", "value": "status_div_2"}],
        }, {
            cls: "BasicSearchForm",
            properties:
            [{
                name: "id",
                value: "#SearchForm1"
            }],

            items: [{
                cls: "BasicTextInput",
                label: "Поиск по записям",

                properties:
                [{
                    name: "placeholder",
                    value: "id"
                }, {
                    name: "title",
                    value: "Поиск записи"
                }, {
                    name: "required",
                    value: true
                }],

                "validators":
                [{
                    "re": /[\w\-]+/gi,
                    "msg": "Некорректный форма ID",
                    "type": "Warring"
                }],

                "listeners": [{
                    "event": "keyup",
                    "action": function()
                    {
                            var value = this.value;

                            if (MINIBASE.joined)
                            {
                                var curent = MINIBASE.joined.filter(function(el){ return el.int_id.match("^" + value, "gi"); }),
                                    table  = MINIBASE.table,
                                    status = document.getElementById("status_div_2");
                                
                                table.clearRows();
                                
                                for (var i=0; i < curent.length && i < MINIBASE.MAX_SIZE; i++)
                                {
                                    var rec = curent[i],
                                        row = table.generateRow([rec.int_id.match(/.{1,10}/g).join("<br>"), rec.created, rec.str.match(/.{1,10}/g).join("<br>")]);
                                    
                                    table.dom.appendChild(row);
                                }

                                status.innerHTML = (curent.length > MINIBASE.MAX_SIZE) ? "Найдено " + curent.length + ", будет отображено только " + MINIBASE.MAX_SIZE + " первые записи.":"";
                            }
                    }
                }]
            }]
        }, {
            cls: "BasicGreed",
            format: ["int_id", "created", "str"],

            properties:
            [{
                name: "id",
                value: "DBGreed"
            }]
        }]
    }]
}