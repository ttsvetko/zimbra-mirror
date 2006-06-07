/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmContactsBaseView(parent, className, posStyle, view, controller, headerList, dropTgt) {

	if (arguments.length == 0) return;
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmListView.call(this, parent, className, posStyle, view, ZmItem.CONTACT, controller, headerList, dropTgt);
};

ZmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD = 0;

ZmContactsBaseView.prototype = new ZmListView;
ZmContactsBaseView.prototype.constructor = ZmContactsBaseView;

ZmContactsBaseView.prototype.toString = 
function() {
	return "ZmContactsBaseView";
};

ZmContactsBaseView.prototype.set =
function(list, sortField, folderId) {
	var subList;
	if (list instanceof ZmList) {
		// compute the sublist based on the folderId if applicable
		list.addChangeListener(this._listChangeListener);
		subList = list.getSubList(this.getOffset(), this.getLimit(), folderId);
	} else {
		subList = list;
	}
	DwtListView.prototype.set.call(this, subList, sortField);
}


ZmContactsBaseView.prototype.paginate = 
function(contacts, bPageForward) {
	var offset = this.getNewOffset(bPageForward);
	var subVector = contacts.getSubList(offset, this.getLimit(), this._controller.getFolderId());
	ZmListView.prototype.set.call(this, subVector);
	this.setOffset(offset);
	this.setSelection(this.getList().get(0));
};

ZmContactsBaseView.prototype._setParticipantToolTip = 
function(address) {
	// XXX: OVERLOADED TO SUPPRESS JS ERRORS..
	// XXX: REMOVE WHEN IMPLEMENTED - SEE BASE CLASS ZmListView
};

ZmContactsBaseView.prototype.getLimit = 
function() {
	return this._appCtxt.get(ZmSetting.CONTACTS_PER_PAGE);
};

ZmContactsBaseView.prototype.getReplenishThreshold = 
function() {
	return ZmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD;
};

ZmContactsBaseView.prototype.getListView = 
function() {
	return this;
};

ZmContactsBaseView.prototype.getTitle = 
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contacts].join(": ");
};

ZmContactsBaseView.prototype._changeListener =
function(ev) {
	// if we dont have a folder, then assume user did a search of contacts
	if (this._controller.getFolderId() != null || ev.event != ZmEvent.E_MOVE)
	{
		ZmListView.prototype._changeListener.call(this, ev);

		if (ev.event == ZmEvent.E_MODIFY)
		{
			this._modifyContact(ev);
		}
		else if (ev.event == ZmEvent.E_CREATE)
		{
			var newContact = ev._details.items[0];
			var folderId = this._controller.getFolderId();

			// only add this new contact to the listview if this is a simple
			// folder search and it belongs!
			if (folderId && folderId == newContact.folderId) {
				var subVector = ev.source.getSubList(this.getOffset(), this.getLimit(), folderId);
				ZmListView.prototype.set.call(this, subVector);

				// only relayout if this is cards view
				if (this instanceof ZmContactCardsView)
					this._layout();

				// always select newly add contact if its been added to the current page of contacts
				this.setSelection(newContact);
			}
		}
	}
};

ZmContactsBaseView.prototype._modifyContact = 
function(ev) {
	// if fileAs changed, resort the internal list
	// XXX: this is somewhat inefficient. We should just remove this contact and reinsert
	if (ev.getDetail("fileAsChanged"))
		this.getList().sort(ZmContact.compareByFileAs);
};

ZmContactsBaseView.prototype._setNextSelection = 
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	
	// get first valid item to select
	var item = this._list.get(this._firstSelIndex);
	if (item == null || (item && item.folderId == ZmFolder.ID_TRASH)) {
		// get the first non-trash contact to select
		item = null;
		var list = this._list.getArray();
		for (var i=0; i < list.length; i++) {
			if (list[i].folderId != ZmFolder.ID_TRASH) {
				item = list[i];
				break;
			}
		}
		
		// reset first sel index
		if (item) {
			var div = document.getElementById(this._getItemId(item));
			this._firstSelIndex = div ? this._list.indexOf(AjxCore.objectWithId(Dwt.getAttr(div, "_itemIndex"))) : -1;
		}
	}
	
	if (item)
		this.setSelection(item);
};


function ZmContactAlphabetBar(parent, appCtxt, className) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, className);

	this._appCtxt = appCtxt;
	this._createHtml();
	this._enabled = true;
};

ZmContactAlphabetBar.prototype = new DwtComposite;
ZmContactAlphabetBar.prototype.constructor = ZmContactAlphabetBar;

ZmContactAlphabetBar.prototype.toString =
function() {
	return "ZmContactAlphabetBar";
};

ZmContactAlphabetBar.prototype.enable =
function(enable) {
	this._enabled = enable;

	var table = document.getElementById(this._alphabetBarId);
	if (table) {
		var cells = table.rows[0].cells;
		for (var i = 0; i < cells.length; i++) {
			var button = Dwt.getObjectFromElement(cells[i]);
			if (button)
				button.setEnabled(enable);
		}
	}
};

ZmContactAlphabetBar.prototype.reset =
function() {
	this._current.setToggled(false);
	this._current = this._all;
	this._all.setToggled(true);
};

ZmContactAlphabetBar.prototype.setButtonByIndex =
function(index) {
	var table = document.getElementById(this._alphabetBarId);
	var cell = table.rows[0].cells[index];

	var button = cell ? Dwt.getObjectFromElement(cell) : null;
	if (button) {
		this._current.setToggled(false);
		button.setToggled(true);
		this._current = button;
	}
};

ZmContactAlphabetBar.prototype.getCurrent =
function() {
	return this._current;
};

ZmContactAlphabetBar.prototype._createHtml =
function() {
	this._alphabetBarId = Dwt.getNextId();
	var alphabet = ZmMsg.alphabet.split(",");

	var html = new Array();
	var idx = 0;

	html[idx++] = "<center>";
	html[idx++] = "<table class='AlphabetBarTable' border=0 cellpadding=0 cellspacing=0 width=80% id='";
	html[idx++] = this._alphabetBarId;
	html[idx++] = "'><tr>";
	for (var i = 0; i < alphabet.length; i++)
		html[idx++] = "<td></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "</center>";

	this.getHtmlElement().innerHTML = html.join("");

	var listener = new AjxListener(this, this._alphabetButtonListener);
	var table = document.getElementById(this._alphabetBarId);
	var cells = table.rows[0].cells;
	for (var i = 0; i < cells.length; i++) {
		var button = new DwtButton(this, DwtButton.TOGGLE_STYLE);
		button.setText(alphabet[i]);
		button.setSize("20");
		button.getHtmlElement().style.minWidth = "20";
		button.addSelectionListener(listener);
		button.setData(Dwt.KEY_ID, i);
		Dwt.associateElementWithObject(cells[i], button);
		cells[i].appendChild(button.getHtmlElement());
		if (i == 0) {
			this._current = this._all = button;
			button.setToggled(true);
		}
	}
};

ZmContactAlphabetBar.prototype._alphabetButtonListener =
function(ev) {
	if (this._current)
		this._current.setToggled(this._current == ev.item);
	this._current = ev.item;

	var letter = this._current == this._all ? null : this._current.getText();
	var clc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactListController();
	clc.searchAlphabet(letter);
};
