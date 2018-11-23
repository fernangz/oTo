<!DOCTYPE html>
<html>
<head>
	<title>oTo</title>
	<link rel="stylesheet" type="text/css" href="/oTo/css/oTo.css">
</head>
<body>
	<h1>oTo</h1>
	<h2>Object to Object</h2>
	<h3><a href="http://nypher.com/oTo/oTo.zip" target="_blank">Download here</a>, also available at <a href="https://github.com/nypher/oTo">github.com/nypher/oTo</a></h3>
	<hr>
	<p><strong>oTo</strong> is a javascript object that allows to extend its properties with files located at the /oTo/parts/ folder and load them automatically uppon call to themselves.</p>
	<p>This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at <a href="http://mozilla.org/MPL/2.0/">http://mozilla.org/MPL/2.0/</a>.</p>
	<hr>
	<h3>Usage</h3>
	<p>The idea is to create more modular code and only load the properties as they are called upon. For example, a log.js file is available at the /oTo/parts/ folder to explain how it works, with it you can use the developer console to try the following:</p>
<xmp>@ftp
	// Put the /oTo/ folder on the root of your website

@html > body
	// Call the engine.js script located in the /oTo/ folder
	<script type="text/javascript" src="/oTo/engine.js"></script>

@console
	> oTo.log('example')
	// This will load the log.js file from /oTo/parts and run the function oTo.log stored on it

@output
	"example"
</xmp>
	<hr>
	<h3>Setup</h3>
	<p>Some options are available to customize the way you use <strong>oTo</strong>, these are all located on the oTo object ao engine.js script:</p>
<xmp>path:
	// Here you can customize the folder that contains both the engine.js script and the /parts folder where all the additional properties will be stored.

partsPath:
	// The name of the folder located under "path" where all the additional properties will be stored.

alias:
	// By default it's disabled any string here will create an alias for the oTo object, allowing you to customize the name of the object that will be used.

dependencies:
	// An array of dependencies that will be loaded before calling for the oTo.start function (located in /parts/start.js).
</xmp>
<hr>
<h3>Extend it</h3>
<p>This is the only reason for wich the <strong>oTo</strong> library was created, you can extend all properties using separated files in the following way:</p>
<xmp>@ftp
	// Create a new file under /oTo/parts/ (or the path you've customized in the setup).

@new_file
	// Create the new oTo.partName (or alias_name.partName customized on the setup)
	oTo.partName = '';
	// The new partName can be either a property, a function or any other extension of the main object
	oTo.partName = function(){};
	// Some names are reserved (the ones used in the engine.js file: path, partsPath, alias, dependencies, js, engine)
	// Also, do not use the ones employed previously (names of the .js files present in the /oTo/parts/ folder)

@ftp
	// Rename the new file with the property name: partName.js

@console
	// You are now able to use the new property: oTo.partName or oTo.partName() if it's a function.
</xmp>
	<script type="text/javascript" src="/oTo/engine.js"></script>
</body>
</html>
