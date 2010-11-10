<?php

/**
 * Description of Db
 *
 * @author roman
 */
class Db {

    private static $_lastQuery;
    private static $_lastResult;
    private static $_link;

    public static function connect() {
        if (self::$_link !== null)
            return true;

        if (!(self::$_link = mysql_connect(get_config('db_host'),
                        get_config('db_user'),
                        get_config('db_password')
                ))) {
            Messages::addError('Ошибка базы данных<br>Не могу соединиться с сервером<br>' . mysql_error());
            return false;
        }

        if (false == self::justQuery("SET NAMES utf8"))
            return false;


        if (!mysql_select_db(get_config('db_db_name'), self::$_link)
                && !self::_tryCreateDb()) {
            Messages::addError('Ошибка базы данных<br>Не могу выбрать базу данных<br>' . mysql_error());
            return false;
        }

        if (!self::_checkTables())
            return false;

        return self::$_link;
    }

    public static function selectGetArray() {
        if (func_num_args() == 0)
            return null;

        $sql = self::_buildReq(func_get_args());

        $result = self::justQuery($sql);

        if ($result) {
            $return = array();

            while ($row = mysql_fetch_assoc($result))
                $return[] = $row;

            return $return;
        }
        return null;
    }

    public static function selectGetVerticalArray() {
        if (func_num_args() == 0)
            return null;

        $sql = self::_buildReq(func_get_args());

        $result = self::justQuery($sql);

        if ($result) {
            $return = array();

            while ($row = mysql_fetch_array($result))
                $return[] = $row[0];

            return $return;
        }
        return null;
    }

    public static function selectGetValue() {
        if (func_num_args() == 0)
            return null;

        $sql = self::_buildReq(func_get_args());

        $result = self::justQuery($sql);

        if ($result)
            return @mysql_result($result, 0);

        return null;
    }

    public static function justQuery() {
        if (func_num_args() == 0)
            return null;

        if (false === self::connect())
            return null;

        $sql = self::_buildReq(func_get_args());

        $sql = str_replace(array_keys(get_config( 'db_table' )),
                get_config( 'db_table' ), $sql);
        
        self::$_lastQuery = $sql;
        //Messages::addMessage($sql);

        self::$_lastResult = mysql_query($sql, self::$_link);

        if (self::$_lastResult === false)
            Messages::addError('Ошибка базы данных<br>' . Db::lastError());

        return self::$_lastResult;
    }

    public static function buildReq() {
        if (func_num_args() == 0)
            return null;

        return self::_buildReq(func_get_args());
    }

    public static function lastError() {
        return "<code>" . mysql_error() . "\n\n" . self::$_lastQuery . "</code>";
    }

    public static function insertedId() {
        return mysql_insert_id();
    }

    public static function getNumRows() {
        return mysql_num_rows(self::$_lastResult);
    }

    private static function _buildReq($arg_list) {
        $template = $arg_list[0];
        unset($arg_list[0]);

        $result = '';
        for ($i = 0; $i < strlen($template); $i++) {
            $ss = substr($template, $i, 2);
            if (in_array($ss, array('@i', '@s', '@f', '@a', '@n')) && count($arg_list) > 0) {
                if ($ss == '@i') // целое
                    $val = intval(array_shift($arg_list));
                if ($ss == '@s') // строка
                    $val = "'" . mysql_escape_string(array_shift($arg_list)) . "'";
                if ($ss == '@f') // дробное
                    $val = floatval(array_shift($arg_list));
                if ($ss == '@a') { // массив целых
                    $tmp = array_shift($arg_list);
                    foreach ($tmp as $id => $v) {
                        $tmp[$id] = intval(trim($v));
                    }
                    $val = '(' . implode($tmp, ', ') . ')';
                }
                if ($ss == '@n') // строка в обратных кавычках
                    $val = "`" . mysql_escape_string(array_shift($arg_list)) . "`";

                $result .= $val;
                $i++;
            } else
                $result .= substr($template, $i, 1);
        }

        return $result;
    }

    private static function _tryCreateDb() {
        if (!self::justQuery('CREATE DATABASE @n', get_config('db_db_name')))
            return false;

        return mysql_select_db(get_config('db_db_name'), self::$_link);
    }

    private static function _checkTables() {
        $tables = self::selectGetVerticalArray('show tables');

        //var_export ($tables);

        if (!is_array($tables))
            return false;

        $tabl_sql['events'] = 'CREATE TABLE @n (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` tinyint(1) NOT NULL,
  `value` bigint(20) NOT NULL,
  `date` datetime NOT NULL,
  `description` varchar(300) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8';

        $tabl_sql['ev2tag'] = 'CREATE TABLE @n (
  `ev_id` bigint(20) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`ev_id`,`tag_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8';

        $tabl_sql['tags'] = 'CREATE TABLE @n (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8';

        foreach ($tabl_sql as $key => $value) {
            $name = tn($key);
            if (!in_array($name, $tables)
                    && !self::justQuery($value, $name)) {
                Messages::addError('Не удалось создать таблицу ' . $name);
                return false;
            }
        }

        return true;
    }

}