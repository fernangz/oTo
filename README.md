# oTo
Objtect Transport Object
<h3>Also available at <a href="https://nypher.com/oTo/">nypher.com/oTo/</a></h3>

<hr>

<strong>oTo</strong> is a javascript object that allows to extend its properties with files located at the /oTo/parts/ folder and load them automatically uppon call to themselves.

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

<hr>

<strong>oTo</strong> is based around the concept of a single auto extendable object with a non defined number of properties stored on files located at the /oTo/parts folder.

For a simple example a log.js file is available at the /oTo/parts/ folder to explain how it works, with it you verify thist code:

<pre>
@html > body
    <script type="text/javascript" src="/oTo/engine.js"></script>
@console
    oTo.log('example')
    //This will load the log.js file from /oTo/parts and run the function oTo.log stored on it
@output
    "example"
</pre>
