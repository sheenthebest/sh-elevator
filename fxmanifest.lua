fx_version 'adamant'
game 'gta5'
lua54 'yes'

author 'sheen'
description 'Elevator'
version '1.0'

shared_scripts {
    '@ox_lib/init.lua',
}

server_scripts {
    'server/server.lua',
    'bridge/server/**.lua'
}

client_scripts {
    'client/client.lua',
}

ui_page 'html/index.html'
files { 
    'config.lua',
    
    'html/fonts/DS-Digital.TTF',
    'html/sounds/**.ogg',
    'html/images/**.jpg',
    'html/index.html', 
    'html/script.js',
    'html/styles.css',
}

escrow_ignore {
    '**.lua',
}
