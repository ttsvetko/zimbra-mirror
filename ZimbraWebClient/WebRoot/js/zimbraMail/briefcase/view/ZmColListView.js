/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmColListView =	function(parent, controller, dropTgt, index) {

	this._controller = controller;
	var view = ZmId.VIEW_BRIEFCASE_COLUMN;
	controller._currentView = view;
	this._colIdx = index;

	var params = {parent:parent, dropTgt:dropTgt,
				  view:view, id:ZmId.getViewId(view, index), posStyle:DwtControl.STATIC_STYLE,
				  controller:controller, headerList:this._getHeaderList(parent)};
	ZmBriefcaseBaseView.call(this, params);
	
	//adding the listeners in constructors so that we get listener events
	//for all new columns created on fly
	this._controller._addListListeners(this);	
}

ZmColListView.prototype = new ZmBriefcaseBaseView;
ZmColListView.prototype.constructor = ZmColListView;

ZmColListView.prototype.toString = function() {
	return "ZmColListView";
};

// Constants

ZmColListView.KEY_ID = "_keyId";

ZmColListView.prototype.set =
function(list, sortField) {

	var paging = Boolean(this._itemsToAdd);
	ZmBriefcaseBaseView.prototype.set.apply(this, arguments);

	// show subfolders at top since virtual paging makes them hard to see
	if (!paging) {
		var subs = this._folders = this._controller._getSubfolders();
		if (subs.length) {
			for (var i = subs.length - 1; i >= 0; i--) {
				this._addFolderRow(subs[i]);
			}
		}
	}
};

// Protected methods

ZmColListView.prototype._getHeaderList =
function(parent) {
	return null;
};

// This list view has no headers, so we create the entire row here
ZmColListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, item, params);
	
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20 id='" + this._getFieldId(item, ZmItem.F_FOLDER) + "'><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(item.getIcon());
	htmlArr[idx++] = "</center></td>";
	htmlArr[idx++] = "<td style='vertical-align:middle;' width='100%' id='" + this._getFieldId(item, ZmItem.F_SUBJECT) + "'>&nbsp;";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	htmlArr[idx++] = "</td>";

    htmlArr[idx++] = "<td style='vertical-align:middle;' width='16' align='right' id='" + this._getFieldId(item,ZmItem.F_SUBJECT)+"'>";
    idx = this._getImageHtml(htmlArr, idx, item.getTagImageInfo(), this._getFieldId(item, ZmItem.F_TAG));
	htmlArr[idx++] = "</td>";

	htmlArr[idx++] = "</tr></table>";

	return idx;
};

ZmColListView.prototype._addFolderRow =
function(item, index) {
	var div = this._createItemHtml(item);
	this._addRow(div, index || 0);
	this._setFolderColor(item.folder);
};

ZmColListView.prototype._setFolderColor =
function(folder) {
	var id = this._getFieldId(folder, ZmItem.F_FOLDER);
	var td = document.getElementById(id);
	if (td) {
		AjxImg.setImage(td, folder.getIconWithColor());
	}
};

ZmColListView.prototype._itemClicked =
function(clickedEl, ev) {

	this.parent.setCurrentListIndex(this._colIdx);
	ZmListView.prototype._itemClicked.call(this,clickedEl,ev);

	if (ev.button == DwtMouseEvent.LEFT) {
		this.parent.removeChildColumns(this._colIdx);
		var items = this.getSelection();
		if (items && items.length == 1) {
			var item = items[0];
			if (item.isFolder) {
				this.parent.expandFolder(item.id);
			} else {
				this.parent.showFileProps(item);
			}
		}
	}
};

ZmColListView.prototype._getScrollDiv =
function() {
	return this.parent._divs[this._colIdx];
};

ZmColListView.prototype._getItemId =
function(item) {
	var id = DwtListView.prototype._getItemId.apply(this, arguments);
	return [id, this._colIdx].join(DwtId.SEP);
};

ZmColListView.prototype._folderChangeListener =
function(ev) {

	var org = ev.getDetail("organizers")[0];
	if (!org) { return; }
	var item = new ZmBriefcaseFolderItem(org);
	if (this.folderId && (item.folderId != this.folderId)) { return; }

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY) {
		var id = this._getItemId(org);
		var div = document.getElementById(id);
		if (div) {
			div.innerHTML = this._createItemHtml(item, null, true);
		}
		if (fields && fields[ZmOrganizer.F_COLOR]) {
			this._setFolderColor(org);
		}
	} else if (ev.event == ZmEvent.E_CREATE) {
		var search = this._controller._currentSearch;
		if (this.folderId || (search && search.matches && search.matches(item))) {
			var index = this._getFolderSortIndex(org, ZmFolder.sortCompare);
			this._addFolderRow(item, index);
			this._folders.splice(index, 0, item);
		}
	} else if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		this.removeItem(item, true);
		var index = -1;
		for (var i = 0; i < this._folders.length; i++) {
			if (this._folders[i].id == item.id) {
				index = i;
				break;
			}
		}
		if (index != -1) {
			this._folders.splice(index, 1);
		}
	}
};

ZmColListView.prototype._getFolderSortIndex =
function(folder, sortFunction) {

	if (!(this._folders && this._folders.length)) { return 0; }

	for (var i = 0; i < this._folders.length; i++) {
		var test = sortFunction(folder, this._folders[i]);
		if (test == -1) {
			return i;
		}
	}
	return i;
};
