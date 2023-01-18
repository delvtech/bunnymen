export const htmlSource = `
<div id="#terminal"/>
<div>
    <meta charset="utf-8" />
    <title>Gaiman Text Game</title>
    <!--[if IE]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <script src="https://cdn.jsdelivr.net/npm/jquery"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery.terminal/js/jquery.terminal.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/jquery.terminal/css/jquery.terminal.min.css" rel="stylesheet"/>
    <script src="https://cdn.jsdelivr.net/combine/npm/js-polyfills/keyboard.js,gh/jcubic/static/js/wcwidth.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="Gaiman 1.0.0-beta.3"/>
    <style>
:root {
    --color: #ccc;
    --background: black;
    --link-color: #3377FF;
    --size: 1;
    /* use --glow: 1; to add glow effect */
    /* available animations: terminal-bar, terminal-underline */
    --animation: terminal-blink;
    --font: monospace;
    --options: {}; /* JSON config for jQuery Terminal */
}
body {
    margin: 0;
    padding: 0;
}
#term {
    height: 100vh;
}
    </style>
</div>
<div>
<template id="greetings">
......................................................................
................#.*/.........................../,.....(...............
...............,....#........................,../..*..*/..............
.....................(.....................(...,.,....................
...............%......./..................#...&.......................
................%........*...............*@..(........................
................/.........,............../@.%,........................
................./........(..............%*/(.........................
...................*.......,...........&,..#/.........................
....................,,.....&...........((..,(.........................
......................#....*(.........,#,..%..........................
........................#...(.........@...(...........................
.........................#................(#*.........................
........................,*#...............#*%&........................
.......................@/,................/.(%&*......................
......................(@*.,................(..&&......................
......................@&#*.................#%@@@(.....................
......................*&*..,..............,./@&%@.....................
.......................&,#,.................%%&%@.....................
......................&&*#@(/*,........,,,/&.&%%&.....................
......................@%*..(##/,.....*///*,..&(&@.....................
......................@(../%...../........%,%,#&(.....................
....................../&*..##(.,(.......%/.@.,&#......................
.......................@&..%(#%,.......(&%#&./@.......................
........................&/.&/#%/.......%&/&.,&@*......................
......................*%%&/,*&//.,.,.,/*%&#(.#@/......................
................*%//..,/,(%#/,##/*,/,.#%,//##(.,..,#&,................
............*&%%#(......................,#/........,#...#%%...........
..........,&&%,#,.........................................%&&.........
.........,@@%#,...........................................*@#&........
.........@@&*..............................................&&&#.......

    ____  __  ___   ___   ____  ____  __________   __
   / __ )/ / / / | / / | / /\\ \\/ /  |/  / ____/ | / /
  / __  / / / /  |/ /  |/ /  \\  / /|_/ / __/ /  |/ / 
 / /_/ / /_/ / /|  / /|  /   / / /  / / /___/ /|  /  
/_____/\\____/_/ |_/_/ |_/   /_/_/  /_/_____/_/ |_/   
                                                                       
    </template>     
<div id="term">
</div>`

export const scriptTag = `
<script>
var is_iframe = (function() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
})();
if (is_iframe) {
    window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
            message,
            source,
            lineno,
            colno
        });
        throw error;
    };
}

var term;
var initialized = false;
let helped = false;

function ready() {
    term = $('#term').terminal(function(cmd, ...args) {        
        this.list = () => {
            this.echo('[[;rgba(205,205,0,0.99);]Current Sessions...]');
            for (let i = 0; i < 6; i++) {
                this.echo('[[;rgba(205,205,0,.99);]connected: bunnyman ' + i + ']')
            }
        }

        this.error = (msg) => {
            this.echo('[[b;red;black);]Error: \' + \'msg ' + msg +  \' does not exist. Enter help to get started]');
        }

        if (cmd === 'chat' && !initialized) {
            initialized = true;
        }

        if (cmd === 'ls') {
            return this.list();
        }

        if (cmd === 'help') {
            this.echo('[[;rgba(0, 100, 100);black]\\n\\nWelcome to Bunnymen.\\n\\nThe website and data on this page are all shared with you by other browser visitors.\\nYou are now sharing this data and also serving up the HTML for this site to other visitors.\\nBunnymen uses your browser to become a node and peer directly with other browsers.\\n\\nWe don\\'t have to use centralized services.\\n\\nA few usecaes:\\n-Decentralized Frontends\\n-Reduced reliance on node providers\\n-User safety and data sovereignty\\n\\nThis is a chat application, your privacy is maintained.\\n\\nYou may now chat...]', { typing: true, delay: 20 });
            helped = true;
            return;
        }

        if (['mkdir', 'cd', 'ps', 'grep', 'ssh', 'curl'].includes(cmd)) {
            this.echo('[[;rgba(205,205,0,0.99);]Stay Tuned, these commands and many more are coming... \\nWe believe in a world where data is open and you have direct access. Consider this your future terminal.]')
        }

        if (helped) {
            window.bunnymenDB.set('chat', [cmd]);
            return;
        }

        if (!initialized) {
            return this.error(cmd);
        }
    }, {
        onInit() {
            this.echo('\\n[[b;green;black);]Bunnymen vBeta0.0.] Welcome Anon\\n');
            this.echo('\\n[[;rgba(0, 100, 100);black]Press help to get started...]');
        },
        greetings: greetings.innerHTML,
        prompt: "[[;rgba(0, 100, 100);black]>>> ]",
    });
}

setTimeout(ready, 5);
let prevLength = 0;
let currentLength;

window.bunnymenDB.subscribe('chat', (messages) => {
    if (helped) {
        currentLength = messages.data.length;
        if (prevLength === 50) {
            const lastMessage = messages.data[49]
            term.echo(new Date(lastMessage.timestamp).toISOString() + ' [[b;blue;black);]Node: ' + lastMessage.user + ': ]' + lastMessage.content);
        } else {
            for (let key = prevLength; key <= prevLength; key++) {
                term.echo(new Date(messages.data[key].timestamp).toISOString() + ' [[b;blue;black);]Node: ' + messages.data[key].user + ': ]' + messages.data[key].content);
            }    
        }
    }
    prevLength = currentLength;
});
<\/script>
</div>
</html>
`;