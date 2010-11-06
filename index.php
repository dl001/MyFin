<?php

/*
 * Список событий
 */

require_once 'app/init.php';

Page::set_title('Мои финансы');

/* Получение списка событий
 */

$where = array();

if (isset($_GET['date_start']))
    $where[] = Db::buildReq('events.date > FROM_UNIXTIME(@i)', strtotime($_GET['date_start']));

if (isset($_GET['date_end']))
    $where[] = Db::buildReq('events.date < FROM_UNIXTIME(@i)', strtotime($_GET['date_end']));

if (isset($_GET['mft'])) // money flow type
    $where[] = Db::buildReq('events.type = @i', (bool)$_GET['mft']);

if (isset($_GET['by_tag']))
    $sql = 'SELECT SQL_CALC_FOUND_ROWS events.* FROM `events`, `ev2tag` WHERE '
            . Db::buildReq('ev2tag.ev_id = events.id AND ev2tag.tag_id = @i', $_GET['by_tag'])
            . (count($where) > 0 ? ' AND ' . implode(' AND ', $where) : '')
            . ' ORDER BY events.date DESC';
else
    $sql = 'SELECT SQL_CALC_FOUND_ROWS * FROM `events` '
            . (count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY date DESC';

if (!isset ($_GET['no_limit']))
    $sql .= Db::buildReq(' LIMIT @i', get_config('items_on_page'));

$events_list = Db::selectGetArray($sql);

if (!isset ($_GET['no_limit']) && Db::selectGetValue('SELECT FOUND_ROWS()') > get_config('items_on_page')) {
    $no_limit_link = $_GET;
    $no_limit_link['no_limit'] = 1;
    $no_limit_link = Util::linkFromArray( $no_limit_link );
    Page::addVar('no_limit_link', $no_limit_link);
}

$total_in = 0;
$total_out = 0;

foreach ($events_list as $id => $event) {

    $value = $event['value'] / 100.0;

    if ($event['type']) {
        $total_in += $event['value'];
        $events_list[ $id ]['type_str'] = 'money_in';
        $events_list[ $id ]['symbol'] = '+';
    } else {
        $total_out += $event['value'];
        $value = $value;
        $events_list[ $id ]['type_str'] = 'money_out';
        $events_list[ $id ]['symbol'] = '-';
    }

    $events_list[$id]['value'] = $value;

    $tmp = Db::selectGetArray('SELECT tags.* FROM `tags`, `ev2tag` WHERE'
                    . ' tags.id = ev2tag.tag_id AND ev2tag.ev_id = @i', $event['id']);

    foreach ($tmp as $key => $v) {

        $tmp1 = $_GET;
        $tmp1['by_tag'] = $v['id'];
        unset($tmp1['no_limit']);

        $tmp[$key]['link'] = Util::linkFromArray( $tmp1 );
    }

    $events_list[$id]['tag_list'] = $tmp;

    $tmp = urlencode( $_SERVER["REQUEST_URI"] );
    $events_list[$id]['edit_link'] = "edit.php?id={$event['id']}&r={$tmp}";
    $events_list[$id]['remove_link'] = "remove.php?id={$event['id']}&r={$tmp}";
}

Page::addVar('events_list', $events_list);
Page::addVar('total_in', $total_in / 100.0);
Page::addVar('total_out', $total_out / 100.0);
Page::addVar('total', ($total_in - $total_out) / 100);

/* Построение ссылок для выборок по времени
 */

$date_links['today']['date_start'] = date('Y:m:d H:i:s', mktime(0, 0, 0));
$date_links['today']['date_end'] = date('Y:m:d H:i:s', mktime(23, 59, 59));
$date_links['mouth']['date_start'] = date('Y:m:d H:i:s', mktime(0, 0, 0, date("n"), 1));
$date_links['mouth']['date_end'] = date('Y:m:d H:i:s', mktime(0, 0, 0, date("n")+1, 1));
$date_links['year']['date_start'] = date('Y:m:d H:i:s', mktime(0, 0, 0, 1, 1));
$date_links['year']['date_end'] = date('Y:m:d H:i:s', mktime(0, 0, 0, 1, 1, date("Y") + 1));

foreach ($date_links as $key => $value) {
    $tmp = $_GET;
    $tmp['date_start'] = $value['date_start'];
    $tmp['date_end'] = $value['date_end'];
    unset($tmp['no_limit']);

    $date_links[$key] = Util::linkFromArray($tmp);
}

$tmp = $_GET;
unset($tmp['date_start']);
unset($tmp['date_end']);
$date_links['all'] = Util::linkFromArray($tmp);

Page::addVar('date_links', $date_links);
Page::addVar('date_start', isset($_GET['date_start']) ? $_GET['date_start'] : date('Y:m:d H:i:s', 1));
Page::addVar('date_end', isset($_GET['date_end']) ? $_GET['date_end'] : date('Y:m:d H:i:s', 2147483647));

$hidden_inputs = $_GET;
unset ($hidden_inputs['date_start']);
unset ($hidden_inputs['date_end']);
unset($hidden_inputs['no_limit']);

Page::addVar('hidden_inputs', $hidden_inputs);

/* Построение ссылок для выборок по типу
 */

$money_in_type_link = $_GET;
$money_in_type_link['mft'] = 1;
unset($money_in_type_link['no_limit']);
$money_in_type_link = Util::linkFromArray($money_in_type_link);

$money_out_type_link = $_GET;
$money_out_type_link['mft'] = 0;
unset($money_out_type_link['no_limit']);
$money_out_type_link = Util::linkFromArray($money_out_type_link);

Page::addVar('money_in_type_link', $money_in_type_link);
Page::addVar('money_out_type_link', $money_out_type_link);

/* Параметры выборки
 */

$select = array();

if (isset($_GET['mft'])) {
    $select[] = array(
        'text' => 'тип: <b class=' . ($_GET['mft'] ? 'money_in' : 'money_out') . '>'
        . ($_GET['mft'] ? 'прибыль' : 'расход') . '</b>',
        'link' => Util::linkWithoutParam('mft')
    );
}
if (isset($_GET['by_tag'])) {
    $select[] = array(
        'text' => 'тег: <b>' .
        Db::selectGetValue('SELECT name FROM tags WHERE id = @i', $_GET['by_tag']) . '</b>',
        'link' => Util::linkWithoutParam('by_tag')
    );
}
if (isset($_GET['date_start'])) {
    $select[] = array(
        'text' => 'дата с: <b>' . Util::readlyTime(strtotime($_GET['date_start'])) . '</b>',
        'link' => Util::linkWithoutParam('date_start')
    );
}
if (isset($_GET['date_end'])) {
    $select[] = array(
        'text' => 'дата по: <b>' . Util::readlyTime(strtotime($_GET['date_end'])) . '</b>',
        'link' => Util::linkWithoutParam('date_end')
    );
}

Page::addVar('select', $select);

/* Еще по мелочи
 */

Page::addVar('new_button_link', "edit.php?new&r=" . urlencode( $_SERVER["REQUEST_URI"] ));

/* Всё готово, осталось отрисовать страницу
 */

Page::draw('list');