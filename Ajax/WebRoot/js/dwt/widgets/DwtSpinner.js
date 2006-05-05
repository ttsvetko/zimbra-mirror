/*
 * Copyright (C) 2006, The Apache Software Foundation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @constructor
 * @class
 * Represents a entry field for entering numeric values.  Has 2 arrow buttons
 * that can be used to increment or decrement the current value with a step
 * that can be specified.
 *
 * @extends DwtControl
 *
 * <h4>CSS</h4>
 *
 * - DwtSpinner              -- a table that contains the spinner elements
 * - DwtSpinner-inputCell    -- the TD that holds the input field
 * - DwtSpinner-btnCell      -- a DIV holding the 2 arrow buttons
 * - DwtSpinner-upBtn        -- the DIV button for increment operation
 * - DwtSpinner-downBtn      -- the DIV button for decrement operation
 * - DwtSpinner-up-pressed   -- upBtn while pressed
 * - DwtSpinner-down-pressed -- downBtn while pressed
 * - DwtSpinner-disabled     -- the table gets this class added when the widget is disabled
 *
 * @param {DwtComposite} parent Parent widget, passed to DwtControl
 * @param {String} className the class name for the containing DIV, passed to DwtControl
 * @param {String} posStyle positioning style, passed to DwtControl
 * @param {Number} max The maximum value
 * @param {Number} min The minimum value
 * @param {Number} size Size of the input field, as in <input size="X">
 * @param {Number} value The original value of the input field
 * @param {Number} maxLen The maximum length of the text in the input field
 * @param {Number} step Amount to add or substract when the arrow buttons are pressed
 * @param {Number} decimals Number of decimal digits.  Specify 0 to allow only
 *                 integers (default).  Pass 'null' to allow float numbers but
 *                 not enforce decimals.
 * @param {String} align The align of the input field text; defaults to "right" in dwt.css
 *
 * @author Mihai Bazon
 */
function DwtSpinner(params) {
	if (arguments.length == 0) return;
	DwtControl.call(this, params.parent, params.className, params.posStyle);

	// setup arguments
	this._maxValue      = params.max  != null ? params.max  : null;
	this._minValue      = params.min  != null ? params.min  : null;
	this._fieldSize     = params.size != null ? params.size : 3;
	this._origValue     = params.value     || 0;
	this._maxLen        = params.maxLen    || null;
	this._step          = params.step      || 1;
	this._decimals      = 'decimals' in params ? params.decimals : 0;
	this._align         = params.align     || null;

	// timerFunc is a closure that gets called upon timeout when the user
	// presses and holds the mouse button
	this._timerFunc = AjxCallback.simpleClosure(this._timerFunc, this);

	// upon click and hold we capture mouse events
	this._btnPressCapture = new DwtMouseEventCapture(
		this, "DwtSpinner",
		null, // no mouseover
		null, // no mousedown
		null, // no mousemove
		AjxCallback.simpleClosure(this._stopCapture, this), // mouseup
		null, // no mouseout
		true);  // hard capture

	this._createElements();
};

DwtSpinner.prototype = new DwtControl;
DwtSpinner.prototype.constructor = DwtSpinner;

DwtSpinner.INIT_TIMER = 250;
DwtSpinner.SLOW_TIMER = 125;
DwtSpinner.FAST_TIMER = 33;

DwtSpinner.prototype._createElements = function() {
	var div = this.getHtmlElement();
	var id = Dwt.getNextId();
	this._idField = id;
	this._idUpButton = id + "-up";
	this._idDownButton = id + "-down";
	var html = [ "<table class='DwtSpinner' cellspacing='0' cellpadding='0'><tr>",
		     "<td class='DwtSpinner-inputCell'><input id='", id, "' autocomplete='off' /></td>",
		     "<td><div class='DwtSpinner-btnCell'>",
		     "<div unselectable class='DwtSpinner-upBtn' id='", this._idUpButton, "'>&nbsp;</div>",
		     "<div unselectable class='DwtSpinner-downBtn' id='", this._idDownButton, "'>&nbsp;</div>",
		     "</div></td></tr></table>" ];
	div.innerHTML = html.join("");

	var b1 = this._getUpButton();
	b1.onmousedown = AjxCallback.simpleClosure(this._btnPressed, this, "up");
	var b2 = this._getDownButton();
	b2.onmousedown = AjxCallback.simpleClosure(this._btnPressed, this, "down");
// 	if (AjxEnv.isIE) {
// 		b1.ondblclick = b1.onmousedown;
// 		b2.ondblclick = b2.onmousedown;
//	}
// 	if (AjxEnv.isIE && b1.offsetHeight == 1) {
// 		// we must correct button heights for IE
// 		div = b1.parentNode;
// 		var td = div.parentNode;
// 		div.style.height = td.offsetHeight + "px";
// // 		b1.style.height = b2.style.height = td.offsetHeight / 2 + "px";
// // 		b2.style.top = "";
// // 		b2.style.bottom = "0px";
// 	}
	var input = this.getInputElement();
	if (this._maxLen)
		input.maxLength = this._maxLen;
	if (this._fieldSize)
		input.size = this._fieldSize;
	if (this._align)
		input.style.textAlign = this._align;
	if (this._origValue != null)
		input.value = this._getValidValue(this._origValue);

	input.onblur = AjxCallback.simpleClosure(this.setValue, this, null);
};

DwtSpinner.prototype._getValidValue = function(val) {
	var n = parseFloat(val);
	if (isNaN(n) || n == null)
		n = this._lastValidValue; // note that this may be string
	if (n == null)
		n = this._minValue || 0;
	if (this._minValue != null && n < this._minValue)
		n = this._minValue;
	if (this._maxValue != null && n > this._maxValue)
		n = this._maxValue;
	// make sure it's a number
	n = parseFloat(n);
	if (this._decimals != null)
		n = n.toFixed(this._decimals);
	this._lastValidValue = n;
	return n;
};

DwtSpinner.prototype.getInputElement = function() {
	return document.getElementById(this._idField);
};

DwtSpinner.prototype._getUpButton = function() {
	return document.getElementById(this._idUpButton);
};

DwtSpinner.prototype._getDownButton = function() {
	return document.getElementById(this._idDownButton);
};

DwtSpinner.prototype._getButton = function(direction) {
	switch (direction) {
	    case "up"   : return this._getUpButton();
	    case "down" : return this._getDownButton();
	}
};

DwtSpinner.prototype.getValue = function() {
	return parseFloat(this._getValidValue(this.getInputElement().value));
};

DwtSpinner.prototype.setValue = function(val) {
	if (val == null)
		val = this.getInputElement().value;
	this.getInputElement().value = this._getValidValue(val);
};

DwtSpinner.prototype.setEnabled = function(enabled) {
	DwtControl.prototype.setEnabled.call(this, enabled);
	this.getInputElement().disabled = !enabled;
	var table = this.getHtmlElement().firstChild;
	if (!enabled)
		Dwt.addClass(table, "DwtSpinner-disabled");
	else
		Dwt.delClass(table, "DwtSpinner-disabled");
};

DwtSpinner.prototype._rotateVal = function(direction) {
	var val = this.getValue();
	switch (direction) {
	    case "up"   : val += this._step; break;
	    case "down" : val -= this._step; break;
	}
	this.setValue(val);
};

DwtSpinner.prototype._btnPressed = function(direction) {
	if (!this.getEnabled())
		return;
	Dwt.addClass(this._getButton(direction), "DwtSpinner-" + direction + "-pressed");
	this._direction = direction;
	this._rotateVal(direction);
	this._btnPressCapture.capture();
	this._timerSteps = 0;
	this._timer = setTimeout(this._timerFunc, DwtSpinner.INIT_TIMER);
};

DwtSpinner.prototype._timerFunc = function() {
	var v1 = this.getValue();
	this._rotateVal(this._direction);
	var v2 = this.getValue();
	this._timerSteps++;
	var timeout = this._timerSteps > 4 ? DwtSpinner.FAST_TIMER : DwtSpinner.SLOW_TIMER;
	if (v1 != v2)
		this._timer = setTimeout(this._timerFunc, timeout);
	else
		this._stopCapture();
};

DwtSpinner.prototype._stopCapture = function() {
	if (this._timer)
		clearTimeout(this._timer);
	this._timer = null;
	this._timerSteps = null;
	var direction = this._direction;
	Dwt.delClass(this._getButton(direction), "DwtSpinner-" + direction + "-pressed");
	this._direction = null;
	this._btnPressCapture.release();
	var input = this.getInputElement();
	input.focus();
	Dwt.setSelectionRange(input, 0, input.value.length);
};
