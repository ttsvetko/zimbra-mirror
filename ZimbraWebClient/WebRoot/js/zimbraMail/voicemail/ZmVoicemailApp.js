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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmVoicemailApp(appCtxt, container, parentController) {
	this._phones = [];
	ZmApp.call(this, ZmApp.VOICEMAIL, appCtxt, container, parentController);
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmOrganizer.VOICEMAIL			= ZmEvent.S_VOICEMAIL;

//TODO: Figure out what id to use or should I just use something unique?
ZmOrganizer.ID_VOICEMAIL		= 8675;

// App-related constants
ZmApp.VOICEMAIL						= "Voicemail";
ZmApp.CLASS[ZmApp.VOICEMAIL]		= "ZmVoicemailApp";
ZmApp.SETTING[ZmApp.VOICEMAIL]		= ZmSetting.VOICEMAIL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICEMAIL]	= 80;
ZmApp.QS_ARG[ZmApp.VOICEMAIL]		= "voicemail";

ZmVoicemailApp.prototype = new ZmApp;
ZmVoicemailApp.prototype.constructor = ZmVoicemailApp;

ZmVoicemailApp.prototype.toString = 
function() {
	return "ZmVoicemailApp";
}

// Construction

ZmVoicemailApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetVoicemailController", "Voicemail", new AjxCallback(this, this.getVoicemailController));
};

ZmVoicemailApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.VOICEMAIL,
						{app:			ZmApp.VOICEMAIL,
						 nameKey:		"voicemail",
						 icon:			"Voicemail",
						 soapCmd:		"VoicemailAction",
						 itemClass:		"ZmVoicemail",
						 node:			"m",
						 organizer:		ZmOrganizer.VOICEMAIL,
						 searchType:	"voicemail",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("Voicemail");
			return new ZmVoicemailList(this._appCtxt, search);
		}, this)
						});
};

ZmVoicemailApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("AUTO_PLAY", {textKey:"autoPlay", tooltipKey:"autoPlayTooltip", image:"ApptRecur"});
};

ZmVoicemailApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.VOICEMAIL,
							{app:				ZmApp.VOICEMAIL,
							 nameKey:			"voicemailFolder",
							 defaultFolder:		ZmOrganizer.ID_VOICEMAIL,
							 firstUserId:		256,
							 orgClass:			"ZmVoicemailFolder",
							 orgPackage:		"VoicemailCore",
							 treeController:	"ZmVoicemailTreeController",
							 labelKey:			"voicemail",
							 views:				["voicemail"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmVoicemailFolder.sortCompare",
							 deferrable:		false
							});
};

ZmVoicemailApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.VOICEMAIL,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voicemail",
							  icon:					"VoicemailApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoicemail",
							  defaultSearch:		ZmSearchToolBar.FOR_ANY_MI,
							  overviewTrees:		[ZmOrganizer.VOICEMAIL],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.VOICEMAIL],
							  gotoActionCode:		ZmKeyMap.GOTO_VOICEMAIL,
							  chooserSort:			15,
							  defaultSort:			15
							  });
};

// Public methods

ZmVoicemailApp.prototype.deleteNotify =
function(ids) {
	this._handleDeletes(ids);
};

ZmVoicemailApp.prototype.createNotify =
function(list) {
	this._handleCreates(list);
};

ZmVoicemailApp.prototype.modifyNotify =
function(list) {
	this._handleModifies(list);
};

ZmVoicemailApp.prototype.search =
function(folder, callback) {
	var soapInfo = {
		method: "SearchVoiceRequest", 
		namespace: "urn:zimbraVoice",
		response: "SearchVoiceResponse"
	};
	var searchParams = {
		soapInfo: soapInfo,
		types: AjxVector.fromArray([ZmItem.VOICEMAIL]),
		query: "phone:" + folder.phone.name,
	};
	var search = new ZmSearch(this._appCtxt, searchParams);	
	var responseCallback = new AjxCallback(this, this._handleResponseSearch, [folder, callback]);
	search.execute({ callback: responseCallback });
};

ZmVoicemailApp.prototype._handleResponseSearch =
function(folder, callback, response) {
	var searchResult = response._data;
	var voicemailController = AjxDispatcher.run("GetVoicemailController");
	voicemailController.show(searchResult, folder);
	if (callback) {
		callback.run(searchResult);
	}
};

ZmVoicemailApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Voicemail", false, loadCallback, null, true);
};

ZmVoicemailApp.prototype._handleLoadLaunch =
function(callback) {
    var soapDoc = AjxSoapDoc.create("GetVoiceInfoRequest", "urn:zimbraVoice");
    var respCallback = new AjxCallback(this, this._handleResponseVoiceInfo, callback);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: respCallback
	};
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoicemailApp.prototype._handleResponseVoiceInfo =
function(callback, response) {
	var folderTree = this._appCtxt.getFolderTree();
	var phones = response._data.GetVoiceInfoResponse.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i];
		var phone = new ZmPhone();
		phone._loadFromDom(obj);
		this._phones.push(phone);
	}
	if (this._phones.length) {
		this._getFolders(callback);
	} else {
		if (callback) {
			callback.run();
		}
	}
};

ZmVoicemailApp.prototype._getFolders =
function(callback) {
    var soapDoc = AjxSoapDoc.create("GetVoiceFolderRequest", "urn:zimbraVoice");
    for (var i = 0, count = this._phones.length; i < count; i++) {
	    var node = soapDoc.set("phone");
	    node.setAttribute("name", this._phones[i].name);
    }
    var respCallback = new AjxCallback(this, this._handleResponseGetFolder, [callback]);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: respCallback
	};
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoicemailApp.prototype._handleResponseGetFolder =
function(callback, response) {
	var folderTree = this._appCtxt.getFolderTree();
	var array = response._data.GetVoiceFolderResponse.phone
	for (var i = 0, count = array.length; i < count; i++) {
		this._createFolder(folderTree.root, this._phones[i], array[i].folder[0]);
	}
	if (this.startFolder) {
		this.search(this.startFolder, callback);
	}
};

ZmVoicemailApp.prototype._createFolder =
function(parent, phone, obj) {
	var params = { 
		id: phone.name + obj.name,
		name: obj.name,
		phone: phone,
		callType: obj.name || ZmVoicemailFolder.ACCOUNT,
		view: obj.view,
		parent: parent,
		tree: parent.tree,
	}		
	var folder = new ZmVoicemailFolder(params);
	parent.children.add(folder);
	if (!this.startFolder && (folder.callType == ZmVoicemailFolder.VOICEMAIL)) {
		this.startFolder = folder;
	}
	if (obj.folder) {
		for (var i = 0, count = obj.folder.length; i < count; i++) {
			this._createFolder(folder, phone, obj.folder[i]);
		}
	}
	return folder;
};

ZmVoicemailApp.prototype.activate =
function(active, view) {
};

ZmVoicemailApp.prototype.getVoicemailController = function() {
	if (!this._voicemailController) {
		this._voicemailController = new ZmVoicemailController(this._appCtxt, this._container, this);
	}
	return this._voicemailController;
};

ZmVoicemailApp.prototype._handleDeletes =
function(ids) {
};

ZmVoicemailApp.prototype._handleCreates =
function(list) {
};

ZmVoicemailApp.prototype._handleModifies =
function(list) {
};
