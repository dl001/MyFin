/* Форма правки
 **/

function myfinEditForm(params) {

    var me = this;

    this.draw = function() {

        me.form = me.create('form', me.parent,
        {
            action: me.action,
            method: me.method
        });

        me.draw_description_input();
        me.draw_tags_input();

        var tr = me.create('tr', me.create('table', me.form, {
            className: 'value_date_tbl'
        }));
        me.draw_value_block(me.create('td', tr, {
            width: '280'
        }));

        me.draw_date_input(me.create('td', tr));
        var td = me.create('td', tr, {
            vAlign: 'bottom',
            align: 'right'
        });

        if (me.cancel_handler) {
            me.create('input', td, {
                className: 'save_button',
                type: 'button',
                value: 'Отмена',
                onclick: me.cancel_handler
            });
            me.createTN(" ", td);
        }

        me.create('input', td, {
            className: 'save_button',
            type: 'submit',
            value: 'Сохранить'
        });



        me.create('input', me.form, {
            type: 'hidden',
            name: 'id',
            value: me.id
        });
    };

    // Поле описание
    this.draw_description_input = function(){
        var input_block = me.create('div', me.form,
        {
            className: 'input_block'
        });

        var label = me.create('label', input_block, {
            innerHTML: 'Описание<br>'
        });

        me.description_input = me.create('input', label,
        {
            name: 'description',
            type: 'text',
            value: me.description,
            className: 'description_input'
        });

        me.description_input.onfocus = function() {
            if(this.value=='нет описания ...')
                this.value='';
        };

        me.description_input.onblur = function() {
            if(this.value=='')
                this.value='нет описания ...';
        };
    };

    // Поле теги
    this.draw_tags_input = function(){
        var input_block = me.create('div', me.form,
        {
            className: 'input_block'
        });

        var label = me.create('label', input_block, {
            innerHTML: 'Теги<br>'
        });

        me.tags_input =  me.create('input', label,
        {
            name: 'tags',
            type: 'text',
            value: me.tags,
            className: 'tags_input'
        });

        me.tag_list_div = me.create('div', input_block, {
            className: 'form_tag_list'
        });

        for (i = 0; i < me.tag_list.length; i++) {
            (me.create('span', me.tag_list_div, {
                innerHTML: me.tag_list[i].name,
                onclick: function() {
                me.tags_input.value += ((me.tags_input.value == '') ? '' : ', ') + this.innerHTML;
                }
                })).style.backgroundColor = me.tag_list[i].color;

            me.createTN(" ", me.tag_list_div);
        }
    };

    // Рисует поле ссумы (с радио)
    this.draw_value_block = function(input_block) {
        var label = me.create('label', input_block, {
            innerHTML: 'Сумма<br>'
        });

        me.value_input =  me.create('input', label,
        {
            name: 'value',
            type: 'text',
            value: me.value,
            className: 'value_input'
        });

        me.createTN(" ", input_block);

        label = me.create('label', input_block);
        me.type_radio_in = me.create('input', label, {
            type: 'radio',
            name: 'type',
            value: 1
        });
        me.createTN(" ", label);
        me.create('span', label, {
            className: 'money_in',
            innerHTML: 'прибыль'
        });

        me.createTN(" ", input_block);

        label = me.create('label', input_block);
        me.type_radio_out = me.create('input', label, {
            type: 'radio',
            name: 'type',
            value: 0
        });
        me.createTN(" ", label);
        me.create('span', label, {
            className: 'money_out',
            innerHTML: 'расход'
        });

        (me.type > 0 ? me.type_radio_in : me.type_radio_out).checked = true;

        me.value_input.onfocus = function() {
            if(this.value=='0')
                this.value='';
        };

        me.value_input.onblur = function() {
            if(this.value=='')
                this.value='0';
        };

    };

    this.draw_date_input = function(input_block) {
        var input_id = 'in' + me.randomString();

        me.create('label', input_block, {
            innerHTML: 'Дата<br>',
            htmlFor: input_id
        });

        var cal_wrap = me.create('div', input_block, {
            className: 'cal_wrap'
        });

        me.date_input = me.create('input', cal_wrap,
        {
            name: 'date',
            type: 'text',
            value: me.date,
            className: 'date_input',
            id: input_id
        });

        me.toggle_cal = me.create('div', cal_wrap, {
            className: "toggle_cal"
        });
        me.calendar = me.create('div', cal_wrap, {
            className: "calendar"
        });

        me.kalender = new Kalender(me.date_input, me.calendar, me.toggle_cal);

        if (me.date_input.value == 0)
            me.kalender.writeDateToInput();
    };

    this.show = function() {
        me.hidden = false;
        if (!me.form)
            me.draw();

        me.form.style.display = 'block';
    };

    this.hide = function() {
        me.hidden = true;
        if (!me.form)
            return;

        me.form.style.display = 'none';
    };

    this.toggle = function() {
        me.hidden ? me.show() : me.hide();
    };


    /* * * * * * * * * * *\
    |     Служебные       |
    \* * * * * * * * * * */

    /* Возвращает элемент по id
     */
    this.byId = function (node) {
        return typeof node == 'string' ? document.getElementById(node) : node
    };

    /* Создает элемент и добавляет его в parent
    */
    this.create = function(type, parent, params) {
        var elem = document.createElement(type);
        if (parent)
            parent.appendChild(elem);

        if (params){
            for(var prop in params) {
                if (!params.hasOwnProperty(prop)) continue
                elem[prop] = params[prop]
            }
        }

        return elem;
    };

    this.randomString = function () {
        return (new Date().getTime()).toString(16) + '_' + (Math.floor(Math.random() * 256)).toString(16);
    };

    /* Создает TextNode и добавляет его в parent
    */
    this.createTN = function(text, parent) {
        var elem = document.createTextNode(text);
        if (parent)
            parent.appendChild(elem);
        return elem;
    };



    /* * * * * * * * * * *\
    |     Конструктор     |
    \* * * * * * * * * * */

    if (params === undefined)
        params = {};

    this.description = params.description || 'нет описания ...';
    this.tags = params['tags'] || '';
    this.value = params['value'] || 0;
    this.type = params.type || 0;
    this.date = params.date || 0; //тут лажа, но пока это не нужно (надо не 0 а строку )
    this.id = params.id || 0;

    this.cancel_handler = params.cancel_handler || null;

    this.tag_list = params.tag_list || [];

    this.action = params.action || '';
    this.method = params.method || 'post';

    this.toggle_button = params.toggle_button ? this.byId(params.toggle_button) : null;

    // тут тоже лажа (надо не document а body)
    this.parent = params.parent ? this.byId(params.parent) : document;

    this.hidden = true;

    if (this.toggle_button)
        this.toggle_button.onclick = me.toggle;
}

// Функция для создания формы (весит на кнопках "правка")
function csf ( id, tags, desc, value, type, action_url, date ){

    var event_tr = document.getElementById('event_tr_' + id);
    var event_tr_dispaly_def = event_tr.style.display;
    event_tr.style.display = 'none';

    var form = null;

    var onclick_hadler = function(){
        form.toggle();
        event_tr.style.display = (event_tr.style.display == event_tr_dispaly_def) ?
        'none' : event_tr_dispaly_def;
        return false;
    };

    form = new myfinEditForm({
        parent: 'td4_item_form_' + id,
        tags: tags,
        description: desc,
        value: value,
        type: type,
        id: id,
        action: action_url,
        date: date,
        tag_list: myfin_global_tag_list,
        cancel_handler: onclick_hadler
    });

    form.show();

    var tmp = document.getElementById('edit_button_' + id);
    tmp.onclick = onclick_hadler;
    tmp = document.getElementById('descr_text_' + id);
    tmp.onclick = onclick_hadler;

    return false;
}


// *****************************************************************************************************
// *****************************************************************************************************
// *****************************************************************************************************
// *****************************************************************************************************

/* Мой хороший календарь,
 * с шахматами и поэтессами
 */

function Kalender(input, parent, toggle_button, headerInBottom) {
    var me = this; // магия

    /* Перерисовывает
     */
    this.repaint = function() {
        var days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
        var mouths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

        me.my_div.innerHTML = ''; // вместо removeAllChilds()

        var table = me.create('table', me.my_div);

        // Первая строчка (месяц, год и кнопки)
        var firthRow = me.create('tr');
        firthRow.className = 'th';

        var th = me.create('th', firthRow);
        th.innerHTML = '←';
        th.onclick = me.mouthBack;
        th.className = 'ch_month back';

        th = me.create('th', firthRow);
        th.colSpan = 5;
        th.innerHTML = mouths[me.cur_mouth.getMonth()] + ' ' + me.cur_mouth.getFullYear();
        th.className = 'month_name';

        th = me.create('th', firthRow);
        th.innerHTML = '→';
        th.onclick = me.mouthForward;
        th.className = 'ch_month forward';

        if( !headerInBottom )
            table.appendChild(firthRow);

        // Вторая строчка (дни недели)
        var tr = me.create('tr', table);
        tr.className = 'day_names'
        for (var i = 0; i < 7; i++){
            var td = me.create('td', tr);
            td.innerHTML = days[i];
        }

        // Остальные строчки (числа месяца)
        me.cur_mouth.setDate(1);
        var d_count = (new Date(me.cur_mouth.getFullYear(), me.cur_mouth.getMonth() + 1, 0)).getDate();

        var day = me.cur_mouth.getDay() - 1;
        if (day == -1)
            day = 6;

        tr = me.create('tr', table);
        for (var i = 0; i < day; i++)
            me.create('td', tr).className = 'empty';

        for (var i = 0; i < d_count; i++) {
            if (day == 7) {
                day = 0;
                tr = me.create('tr', table);
            }
            day++;
            var td = me.create('td', tr);
            td.className = 'regular';

            if (me.cur_mouth.getFullYear() == me.cur_date.getFullYear() &&
                me.cur_mouth.getMonth() == me.cur_date.getMonth() &&
                i+1 == me.cur_date.getDate())
                td.className += ' current';

            td.onclick = function() {
                me.hide();
                var tmp = me.cur_date;
                tmp.setYear( me.cur_mouth.getFullYear() );
                tmp.setMonth( me.cur_mouth.getMonth() );
                tmp.setDate( this.innerHTML );
                me.setCurDate(tmp);
                me.writeDateToInput();
            };
            td.innerHTML = i + 1;
        }

        for (;day < 7; day++)
            me.create('td', tr).className = 'empty';

        if( headerInBottom )
            table.appendChild(firthRow);
    };


    /* Сдвигает календарь на месяц назад
     */
    this.mouthBack = function( evt ) {
        me.cur_mouth.setMonth(me.cur_mouth.getMonth() - 1);
        me.repaint();
    };

    /* Сдвигает календарь на месяц вперед
     */
    this.mouthForward = function( evt ) {
        me.cur_mouth.setMonth(me.cur_mouth.getMonth() + 1);
        me.repaint();
    };

    /* Устанавливает текущюю дату, и обнуляет сдвиг календаря.
     */
    this.setCurDate = function ( date ) {
        me.cur_date = date;
        me.cur_mouth = new Date(date);
    };



    /* * * * * * * * * * * * * * * * * * * * * *\
    |                 Отображение               |
    \* * * * * * * * * * * * * * * * * * * * * */

    /* Отображение
     */
    this.show = function() {
        me.readAndRepaint();
        me.input.onkeyup = me.checkDatePlus;
        me.my_div.style.display = 'block';
        me.hidden = false;

        document.addEventListener ?
        document.addEventListener( 'click', me.hide, false) :
        document.attachEvent( 'onclick', me.hide );
    };
    /* Скрытие
     */
    this.hide = function() {
        document.removeEventListener ?
        document.removeEventListener( 'click', me.hide, false ) :
        document.detachEvent( 'onclick', me.hide );

        me.input.onkeyup = me.checkDate;
        me.my_div.style.display = 'none';
        me.hidden = true;
    };
    /* Переключение
     */
    this.toggle = function( evt ) {
        me.stopPropagation(evt);
        me.hidden ? me.show() : me.hide();
    };




    /* * * * * * * * * * * * * * * * * * * * * *\
    |             Работа с input'ом             |
    \* * * * * * * * * * * * * * * * * * * * * */

    /* Считывание
     */
    this.readDateFromInput = function() {
        if(me.isCorrectInput())
            me.setCurDate( me.str2date(me.input.value) );
        else {
            //alert('Не верный формат!\nДата установлена на сегодня');
            me.setCurDate( new Date() );
        }
    };
    /* Запись
     */
    this.writeDateToInput = function() {
        var cd = me.cur_date;
        me.input.value = me.numberFormat(cd.getFullYear(), 4) + '-' +
        me.numberFormat(cd.getMonth()+1, 2) + '-' +
        me.numberFormat(cd.getDate(), 2) + ' ' +
        me.numberFormat(cd.getHours(), 2) + ':' +
        me.numberFormat(cd.getMinutes(), 2);
    }
    /* Проверяет корректность даты в инпуте,
     * и делает текст красным если дата не корректна
     */
    this.checkDate = function() {
        me.input.style.color = me.isCorrectInput() ? me.defaultInputColor : 'red';
    };

    /* Проверяет дату в инпуте на корректность
     */
    this.isCorrectInput = function() {
        return me.str2date(me.input.value) != null;
    };

    /* Создает Date из строки формата гггг-мм-дд чч:мм
     */
    this.str2date = function( str ) {
        var re = new RegExp("([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2})", "g");
        var myArray = re.exec(str);

        if ( myArray != null ) {
            var date = new Date(myArray[1], myArray[2] - 1, myArray[3], myArray[4], myArray[5], 0, 0);

            if(date.getTime())
                return date;
        }

        return null;
    }



    /* * * * * * * * * * *\
    |     Служебные       |
    \* * * * * * * * * * */

    /* Возвращает элемент по id
     */
    this.byId = function (node) {
        return typeof node == 'string' ? document.getElementById(node) : node
    };

    /* Создает элемент и добавляет его в parent
     */
    this.create = function(type, parent) {
        var elem = document.createElement(type);
        if (parent)
            parent.appendChild(elem);
        return elem;
    };

    /* Создает TextNode и добавляет его в parent
     */
    this.createTN = function(text, parent) {
        var elem = document.createTextNode(text);
        if (parent)
            parent.appendChild(elem);
        return elem;
    };

    /* Добавляет к числу нули слева
     * Написана плохо
     */
    this.numberFormat = function( number, length ) {
        var result = number;
        for (var i = 10; length > 1; i *= 10, length--) {
            if (number < i)
                result = '0' + result;
        }
        return result;
    };

    this.stopPropagation = function( evt ) {
        ( evt ) ? evt.stopPropagation() : window.event.cancelBubble = true;
    };




    /* * * * * * * * * * *\
    |      Обертки        |
    \* * * * * * * * * * */

    /* checkDate + Обновление календаря
     */
    this.checkDatePlus = function() {
        me.checkDate();
        if (me.isCorrectInput())
            me.readAndRepaint();
    };

    /* Считывает и перерисовывает
     */
    this.readAndRepaint = function() {
        me.readDateFromInput();
        me.repaint();
    };



    /* * * * * * * * * * *\
    |     Конструктор     |
    \* * * * * * * * * * */

    this.input = this.byId(input);
    this.parent = this.byId(parent);
    this.toggle_button = this.byId(toggle_button);

    this.hidden = true;

    this.my_div = this.create('div', this.parent);
    this.my_div.style.display = 'none';
    this.my_div.className = 'Kalender';
    this.my_div.onclick = this.stopPropagation;

    this.defaultInputColor = this.input.style.color;
    this.input.onkeyup = this.checkDate;
    this.input.onclick = this.stopPropagation;

    this.toggle_button.onclick = this.toggle;

    this.readDateFromInput();
}