/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmSignature = function(id) {
	this.id = id;
};

ZmSignature.prototype.toString = function() {
	return "ZmSignature";
};

//
// Data
//

ZmSignature.prototype.name = "";
ZmSignature.prototype.contentType = ZmMimeTable.TEXT_PLAIN;
ZmSignature.prototype.value = "";

//
// Static functions
//

ZmSignature.createFromJson = function(object) {
	var signature = new ZmSignature(object.id);
	signature.setFromJson(object);
	return signature;
};

//
// Public methods
//

ZmSignature.prototype.create = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleCreateResponse, [callback]) : null;
	var resp = this._sendRequest("CreateSignatureRequest", false, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleCreateResponse(callback, resp);
	}
};

ZmSignature.prototype.save = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleModifyResponse, [callback]) : null;
	var resp = this._sendRequest("ModifySignatureRequest", false, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleModifyResponse(callback, resp);
	}
};

ZmSignature.prototype.doDelete = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleDeleteResponse, [callback]) : null;
	var resp = this._sendRequest("DeleteSignatureRequest", true, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleDeleteResponse(callback, resp);
	}
};

ZmSignature.prototype.setFromJson = function(object) {
	this.name = object.name || this.name;
	var content = object.content && object.content[0];
	if (content) {
		this.contentType = content.type || this.contentType;
		this.value = content._content != null ? content._content : this.value;
	}
};

ZmSignature.prototype.getContentType = function(){
    return this.contentType;
};

ZmSignature.prototype.setContentType = function(ct){
    this.contentType = ct || ZmMimeTable.TEXT_PLAIN;  
};

/**
 * @param outputType	[string]	(Optional) Formats the resulting
 *									signature text to the specified
 *									content-type. If not specified,
 *									the signature text is returned in
 *									the original format.
 */

ZmSignature.prototype.getValue = function(outputType) {
	
    var isHtml = this.contentType == ZmMimeTable.TEXT_HTML;
	var value = this.value;

	var type = outputType || this.contentType;
	if (type != this.contentType) {
        value = isHtml ? AjxStringUtil.convertHtml2Text(value) : AjxStringUtil.convertToHtml(value);
	}

    return value;
};


//
// Protected methods
//

ZmSignature.prototype._sendRequest =
function(method, idOnly, respCallback, errorCallback, batchCmd) {
	var soapDoc = AjxSoapDoc.create(method, "urn:zimbraAccount");
	var signatureEl = soapDoc.set("signature");
	if (this.id) {
		signatureEl.setAttribute("id", this.id);
	}
	if (!idOnly) {
		signatureEl.setAttribute("name", this.name);
		var contentEl = soapDoc.set("content", this.value, signatureEl);
		contentEl.setAttribute("type", this.contentType);

        //Empty the other content type
        var emptyType = (this.contentType == ZmMimeTable.TEXT_HTML) ? ZmMimeTable.TEXT_PLAIN : ZmMimeTable.TEXT_HTML;
        contentEl = soapDoc.set("content", "", signatureEl);
		contentEl.setAttribute("type", emptyType);
        
	}

	if (batchCmd) {
		batchCmd.addNewRequestParams(soapDoc, respCallback, errorCallback);
		return;
	}

	var appController = appCtxt.getAppController();
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(respCallback),
		callback: respCallback,
		errorCallback: errorCallback
	}
	return appController.sendRequest(params);
};

ZmSignature.prototype._handleCreateResponse = function(callback, resp) {
	// save id
	this.id = resp._data.CreateSignatureResponse.signature[0].id;

	// add to global hash
	var signatures = appCtxt.getSignatureCollection();
	signatures.add(this);

	if (callback) {
		callback.run();
	}
};

ZmSignature.prototype._handleModifyResponse = function(callback, resp) {
	// promote settings to global signature
	var signatures = appCtxt.getSignatureCollection();
	var signature = signatures.getById(this.id);
	signature.name = this.name;
	signature.value = this.value;
    signature.contentType = this.contentType;
	signatures._notify(ZmEvent.E_MODIFY, { item: signature });

	if (callback) {
		callback.run();
	}
};

ZmSignature.prototype._handleDeleteResponse = function(callback, resp) {
	// remove from global hash
	var signatures = appCtxt.getSignatureCollection();
	signatures.remove(this);

	if (callback) {
		callback.run();
	}
};
