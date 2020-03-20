var index_page =
{
    reverse: false,
    cls: "index_page",

    items: [{
        cls: "BasicPlate",
        properties: [{
            "name": "style",
            "value": "position: fixed; bottom: 0%;"
        }],

        items: [{
            cls: "BasicFloatingWindow",

            items:
            [{
                cls: "BasicHeader",
                label: "Log DB"
            }, {
                cls: "BasicButton",
                innerHTML: "■ Просмотр базы",

                listeners:
                [{
                    "event": "click",
                    "action": function()
                    {
                        MINIBASE.replacePage("base_browser");
                    }
                }]
            }, {
                cls: "BasicButton",
                innerHTML: "■ Загрузить файл для добавления в базу",

                listeners:
                [{
                    "event": "click",
                    "action": function()
                    {
                        MINIBASE.replacePage("base_load");
                    }
                }]
            }]
        }]
    }]
}