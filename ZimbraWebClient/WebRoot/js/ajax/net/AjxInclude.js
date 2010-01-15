/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */


/**
 * Utility function (NOT object!) that loads external files in a specified
 * order (thus it'll work fine if scripts have dependencies, you just need to
 * pass them all in the includes array).  If a callback is given, it will be
 * called when all the scripts in the includes array (and possibly dependencies
 * generated by them using document.write) are loaded.
 *
 * Note that scripts are loaded asynchronously -- this function returns
 * immediately, but there's no guarantee that scripts have finished loading by
 * that time.  DO pass a callback if you want to execute code that rely on
 * those scripts.
 *
 * @param includes [Array] -- an array of strings; each is the URL to some script
 * @param baseurl [String] -- URL that will be prepended to scripts with a
 *                            relative address (not starting with http://, ftp:// or /)
 * @param callback [AjxCallback] -- will be called when all scripts were processed
 *
 * @author Mihai Bazon, <mihai@zimbra.com>
 */
AjxInclude = function(includes, baseurl, callback, proxy) {
	var head = document.getElementsByTagName("head")[0];

	function loadNextScript(script) {
		if (AjxEnv.isIE && script && !/loaded|complete/.test(script.readyState))
			return;
		if (script) {
			// Clear the event handler so IE won't leak.  (Did you know
			// that Microsoft knew about the mem. leak bug in 1998
			// and by the end of 2005 it's still not fixed? :-p
			// http://www.bazon.net/mishoo/home.epl?NEWS_ID=1281 )
			script[AjxInclude.eventName] = null;
		}
		var scripts = AjxInclude.dwhack_scripts.length > 0
			? AjxInclude.dwhack_scripts
			: includes;
		window.status = "";
		if (scripts.length > 0) {
			var fullurl = scripts.shift();
			var orig = fullurl;
			if (!/^((https?|ftps?):\x2f\x2f|\x2f)/.test(fullurl)) {
				if (baseurl)
					fullurl = baseurl + fullurl;
				if (cacheKillerVersion)
					fullurl += "?v=" + cacheKillerVersion;
			} else if (proxy && fullurl.indexOf('/') != 0) {
 				// fully qualified URL-s will go through our proxy
 				fullurl = proxy + AjxStringUtil.urlEncode(fullurl);
			}
			var script = document.createElement("script");
			var handler = AjxCallback.simpleClosure(loadNextScript, null, script);
			if (AjxEnv.isIE) {
				script.attachEvent("onreadystatechange", handler);
				script.attachEvent("onerror", handler);
			} else {
				script.addEventListener("load", handler, true);
				script.addEventListener("error", handler, true);
			}
			script.type = "text/javascript";
			script.src = fullurl;
			window.status = "Loading script: " + orig;
			head.appendChild(script);
		} else if (includes.length == 0) {
			script = null;
			head = null;
			if (callback)
				callback.run();
		}
	};

	loadNextScript(null);
};

// The document.write hack.  If files are present in this array, they will be
// favored by AjxInclude (see inner function loadNextScript).  I originally
// tried to make the function below an inner function too, but this doesn't
// work because the whole mess is asynchronous (think multiple Zimlets loading
// external files that call document.write).
AjxInclude.dwhack_scripts = [];
document.write = document.writeln = function() {
	// let's assume there may be more arguments
	var a = [];
	for (var i = 0; i < arguments.length; ++i)
		a[i] = arguments[i];
	var str = a.join("");
	if (/<script[^>]+src=([\x22\x27])(.*?)\1/i.test(str)) {
		// we have a <script>, let's add it to our includes list. :-)
		AjxInclude.dwhack_scripts.push(RegExp.$2);
	}
	// If it's not a script, we can't do anything...  The idea is that the
	// original document.write would mess all our HTML anyway, so we can't
	// call it.  If scripts rely on it to insert elements, well, that's too
	// bad--they won't work.  For this reason we don't even care to save
	// the original functions.
};


// XXX: DO NOT REMOVE - PREVENTS MEM LEAK IN IE
if (AjxEnv.isIE) {
	AjxInclude._removeWriteln = function() {
		document.write = document.writeln = null;
		window.detachEvent("onunload", AjxInclude._removeWriteln);
	};
	window.attachEvent("onunload", AjxInclude._removeWriteln);
}
