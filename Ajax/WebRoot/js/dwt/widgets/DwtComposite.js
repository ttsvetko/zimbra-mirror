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
 * Creates a composite class. A composite class may contain other controls. All controls
 * that need to contain child controls (such as menus, trees) should inherit from this
 * class.
 * 
 * <h4>CSS</h4>
 * None
 * 
 * <h4>Keyboard Actions</h4>
 * None
 * 
 * <h4>Events</h4>
 * See <i>DwtControl</i>
 * 
 * @author Ross Dargahi
 * 
 * @param {DwtComposite} parent Parent widget. Except in the case of <i>DwtShell</i> the
 * 		parent will be a control that has subclassed from <i>DwtComposite</i> 
 * @param {string} className CSS class. If not provided defaults to the class name (optional)
 * @param {string} posStyle Positioning style (absolute, static, or relative). If
 * 		not provided defaults to <i>DwtControl.STATIC_STYLE</i> (optional)
 * @param {boolean} deferred If true, postpone initialization until needed. If not
 * 		specified defaults to false (optional)
 * @param {int} id An explicit ID to use for the control's HTML element. If not
 * 		specified defaults to an auto-generated id (optional)
 * @param {int} index index at which to add this control among parent's children (optional)
 */
function DwtComposite(parent, className, posStyle, deferred, id, index) {

	if (arguments.length == 0) return;
	className = className || "DwtComposite";
	DwtControl.call(this, parent, className, posStyle, deferred, id, index);

	/** Vector of child elements
	 * @type AjxVector */
	this._children = new AjxVector();
}

DwtComposite.prototype = new DwtControl;
DwtComposite.prototype.constructor = DwtComposite;

/** Pending elements hash (i.e. elements that have not yet been realized)
 * @type object */
DwtComposite._pendingElements = new Object();


/**
 * This method returns this objects real class name
 * 
 * @return class name
 * @type String
 */
DwtComposite.prototype.toString = 
function() {
	return "DwtComposite";
}

/**
 * Disposes of the control. This method will remove the control from under the
 * control of it's parent and release any resources associate with the compontent
 * it will also notify any event listeners on registered  <i>DwtEvent.DISPOSE</i> event type
 * 
 * In the case of <i>DwtComposite</i> this method will also dispose of all of the composite's
 * children
 * 
 * Subclasses may override this method to perform their own dispose functionality but
 * should generallly call up to the parent method
 * 
 * @see DwtControl#isDisposed
 * @see DwtControl#addDisposeListener
 * @see DwtControl#removeDisposeListener
 */
DwtComposite.prototype.dispose =
function() {
	if (this._disposed) return;
	
	DBG.println(AjxDebug.DBG3, "DwtComposite.prototype.dispose: " + this.toString() + " - " + this._htmlElId);
	var sz = this._children.size();
	if (sz > 0) {
		// Dup the array since disposing the children will result in removeChild
		// being called which will modify the array
		var a = this._children.getArray().slice(0);
		for (var i = 0; i < sz; i++) {
			if (a[i].dispose)
				a[i].dispose();
		}
	}		
	DwtControl.prototype.dispose.call(this);
}

/**
 * @return
 * @type array
 */
DwtComposite.prototype.getChildren =
function() {
	return this._children.getArray().slice(0);
}

/**
 * @return the composite's number of children
 * @type number
 */
DwtComposite.prototype.getNumChildren =
function() {
	return this._children.size();
}

/**
 * Disposes of all of the composite's children
 */
DwtComposite.prototype.removeChildren =
function() {
	var a = this._children.getArray();
	while (this._children.size() > 0)
		a[0].dispose();
}

/**
 * Removes all of the composite's child by calling <code>removeChildren</code> and
 * also clears out the composite's HTML element of any content
 * 
 * @see #removeChildren
 */
DwtComposite.prototype.clear =
function() {
	this.removeChildren();
	this.getHtmlElement().innerHTML = "";
}

/**
* Adds the given child control to this composite.
*
* @param {DwtControl} child	The child control to add
* @param {number} index index at which to add the child (optional)
*/
DwtComposite.prototype.addChild =
function(child, index) {
	this._children.add(child, index);
	
	// check for a previously removed element
	var childHtmlEl = child._removedEl ? child._removedEl : child.getHtmlElement();
	if (this instanceof DwtShell && this.isVirtual()) {
		// If we are operating in "virtual shell" mode, then children of the shell's html elements
	 	// are actually parented to the body
		document.body.appendChild(childHtmlEl);
	} else {
		var htmlEl = this.getHtmlElement();
		if (index && (index < htmlEl.childNodes.length))
			htmlEl.insertBefore(childHtmlEl, htmlEl.childNodes[index]);	
		else
			htmlEl.appendChild(childHtmlEl);
	}
	if (child._removedEl)
		child._removedEl = null;
}

/**
* Removes the given child control from this control. A removed child is no longer retrievable via
* <code>getHtmlElement()</code>, so there is an option to save a reference to the removed child. 
* That way it can be added later using <code>addChild()</code>.
*
* @param {DwtConrol} child the child control to remove
* @param {boolean} preserveElement if true, the child will save a reference to its removed element
* 
* @see #addChild
*/
DwtComposite.prototype.removeChild =
function(child, preserveElement) {
	DBG.println(AjxDebug.DBG3, "DwtComposite.prototype.removeChild: " + child._htmlElId + " - " + child.toString());
	// Make sure that the child is initialized. Certain children (such as DwtTreeItems)
	// can be created in a deferred manner (i.e. they will only be initialized if they
	// are becoming visible.
	if (child.isInitialized()) {
		this._children.remove(child);
		// Sometimes children are nested in arbitrary HTML so we elect to remove them
		// in this fashion rather than use this.getHtmlElement().removeChild(child.getHtmlElement()
		var childHtmlEl = child.getHtmlElement();
		if (childHtmlEl && childHtmlEl.parentNode) {
			var el = childHtmlEl.parentNode.removeChild(childHtmlEl);
			if (preserveElement)
				child._removedEl = el;
		}
	}
}
