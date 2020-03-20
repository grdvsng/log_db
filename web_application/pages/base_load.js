var base_load =
{
    reverse: false,
    cls: "base_load",

    items: [{
        cls: "BasicHeader",
        keepScroll: true,
        label: "Log DB",

        properties:
        [{
            "name": "title",
            "value": "На главную"
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
            cls: "BasicFilesForm",
            format: ["Название Файла", "Размер", " "],
            term_text: 'Удалить', 
            address: '/rest/update_db',
            onreadystatechange: function(resp)
            {
                if (resp.response)
                {
                    var status_div = document.getElementById("status_div_1"),
                        obj        = JSON.parse(resp.response);

                    status_div.innerHTML = "Обработано: " + obj.cout + 
                                           "<br>Добавлено: " + obj.resolved.length +
                                           "<br>Отклонено: " + obj.rejected.length + 
                                           "<p style='color: orange;'>Подробные сведения в консоли разработчика.";
                    
                    console.log(obj);
                }
            },

            max_files: 1,

            submit: 
            {
                cls: "BasicButton",
                innerHTML: "Отправить",
                name: "files",
            },

            file_input: 
            {
                cls: "BasicFileInput",
                label: "Загрузить файл",
            }
        }, {
            cls: "BasicStatusDiv",
            properties: [{"name": "id", "value": "status_div_1"}],
        }]
    }]
}