<?php
function get_config( $name ) {
    $config['db_host'] = 'localhost';
    $config['db_user'] = 'root';
    $config['db_password'] = '123';
    $config['db_db_name'] = 'myfin';

    $config['items_on_page'] = 10;

    return $config[ $name ];
}