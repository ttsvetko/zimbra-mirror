/**
* @class ZaGlobalConfigViewController 
* @contructor ZaGlobalConfigViewController
* @param appCtxt
* @param container
* @param app
* @author Greg Solovyev
**/
function ZaGlobalConfigViewController(appCtxt, container, app) {
	ZaController.call(this, appCtxt, container, app);
	this._evtMgr = new AjxEventMgr();
	this._UICreated = false;
	this._confirmMessageDialog;	
}

ZaGlobalConfigViewController.prototype = new ZaController();
ZaGlobalConfigViewController.prototype.constructor = ZaGlobalConfigViewController;

ZaGlobalConfigViewController.STATUS_VIEW = "ZaGlobalConfigViewController.STATUS_VIEW";

ZaGlobalConfigViewController.prototype.show = 
function(item) {

	if(!this._UICreated) {
  		this._ops = new Array();
		this._ops.push(new ZaOperation(ZaOperation.SAVE, ZaMsg.TBB_Save, ZaMsg.ALTBB_Save_tt, ZaImg.I_SAVE, ZaImg.ID_SAVE, new AjxListener(this, ZaGlobalConfigViewController.prototype._saveButtonListener)));
		this._toolBar = new ZaToolBar(this._container, this._ops);
	
//		this._view = new ZaGlobalConfigView(this._container, this._app);
		this._view = new GlobalConfigXFormView(this._container, this._app);
		this._appView = this._app.createView(ZaGlobalConfigViewController.STATUS_VIEW, [this._toolBar, this._view]);
		this._UICreated = true;		
	}
	this._app.pushView(ZaGlobalConfigViewController.STATUS_VIEW);
	this._toolBar.getButton(ZaOperation.SAVE).setEnabled(false);  	
	this._app.setCurrentController(this);
	try {		
		item[ZaModel.currentTab] = "1"
		this._view.setDirty(false);
		this._view.setObject(item);
	} catch (ex) {
		this._handleException(ex, "ZaGlobalConfigViewController.prototype.show", null, false);
	}
	this._currentObject = item;		
}


ZaGlobalConfigViewController.prototype.setEnabled = 
function(enable) {
	this._view.setEnabled(enable);
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
ZaGlobalConfigViewController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = params;
		args["obj"] = nextViewCtrlr;
		args["func"] = func;
		//ask if the user wants to save changes			
		this._confirmMessageDialog = new ZaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);					
		this._confirmMessageDialog.setMessage(ZaMsg.Q_SAVE_CHANGES, null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, ZaCosController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, ZaCosController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		func.call(nextViewCtrlr, params);
	}
}

/**
* public getToolBar
* @return reference to the toolbar
**/
ZaGlobalConfigViewController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

ZaGlobalConfigViewController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(ZaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(ZaOperation.SAVE).setEnabled(false);
}

/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
ZaGlobalConfigViewController.prototype._saveAndGoAway =
function (params) {
	this._confirmMessageDialog.popdown();			
	try {
		if(this._saveChanges()) {
			params["func"].call(params["obj"], params["params"]);	
		}
	} catch (ex) {
		this._handleException(ex, "ZaGlobalConfigViewController.prototype._saveAndGoAway", null, false);
	}
}

/**
* Leaves current view without saving any changes
**/
ZaGlobalConfigViewController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();
	try {
		params["func"].call(params["obj"], params["params"]);		
	} catch (ex) {
		this._handleException(ex, "ZaGlobalConfigViewController.prototype._discardAndGoAway", null, false);
	}
}

ZaGlobalConfigViewController.prototype._saveButtonListener = 
function (ev) {
	try {
		if(this._saveChanges()) {
			this._view.setDirty(false);		
			this._toolBar.getButton(ZaOperation.SAVE).setEnabled(false); 
		}
	} catch (ex) {
		this._handleException(ex, "ZaGlobalConfigViewController.prototype._saveButtonListener", null, false);
	}
}

ZaGlobalConfigViewController.prototype._saveChanges =
function () {
	var tmpObj = this._view.getObject();
	var isNew = false;
	if(tmpObj.attrs == null) {
		//show error msg
		this._msgDialog.setMessage(ZaMsg.ERROR_UNKNOWN, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;	
	}

	//check values
	if(!AjxUtil.isNonNegativeInteger(tmpObj.attrs[ZaGlobalConfig.A_zimbraSmtpPort])) {
		//show error msg
		this._msgDialog.setMessage(ZaMsg.ERROR_INVALID_VALUE + ": " + ZaMsg.NAD_SmtpPort + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
		
	if(!AjxUtil.isNonNegativeInteger(tmpObj.attrs[ZaGlobalConfig.A_zimbraGalMaxResults])) {
		//show error msg
		this._msgDialog.setMessage(ZaMsg.ERROR_INVALID_VALUE + ": " + ZaMsg.NAD_GalMaxResults + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	// update zimbraMtaRestriction
	var restrictions = [];
	for (var i = 0; i < ZaGlobalConfig.MTA_RESTRICTIONS.length; i++) {
		var restriction = ZaGlobalConfig.MTA_RESTRICTIONS[i];
		if (tmpObj.attrs["_"+ZaGlobalConfig.A_zimbraMtaRestriction+"_"+restriction]) {
			restrictions.push(restriction);
		}			
	}
	var dirty = restrictions.length > 0;
	if (tmpObj.attrs[ZaGlobalConfig.A_zimbraMtaRestriction]) {
		var prevRestrictions = AjxUtil.isString(tmpObj.attrs[ZaGlobalConfig.A_zimbraMtaRestriction])
		                     ? [ tmpObj.attrs[ZaGlobalConfig.A_zimbraMtaRestriction] ]
		                     : tmpObj.attrs[ZaGlobalConfig.A_zimbraMtaRestriction];
		dirty = restrictions.length != prevRestrictions.length;
		if (!dirty) {
			for (var i = 0; i < prevRestrictions.length; i++) {
				var restriction = prevRestrictions[i];
				if (!tmpObj.attrs["_"+ZaGlobalConfig.A_zimbraMtaRestriction+"_"+restriction]) {
					dirty = true;
					break;
				}
			}
		}
	}
	if (dirty) {
		tmpObj.attrs[ZaGlobalConfig.A_zimbraMtaRestriction] = restrictions;
	}

	//transfer the fields from the tmpObj to the _currentObject, since _currentObject is an instance of ZaDomain
	var mods = new Object();
	for (var a in tmpObj.attrs) {
		if(a == ZaItem.A_objectClass || a == ZaGlobalConfig.A_zimbraAccountClientAttr || 
		a == ZaGlobalConfig.A_zimbraServerInheritedAttr || a == ZaGlobalConfig.A_zimbraDomainInheritedAttr ||
		a == ZaGlobalConfig.A_zimbraCOSInheritedAttr || a == ZaGlobalConfig.A_zimbraGalLdapAttrMap || 
		a == ZaGlobalConfig.A_zimbraGalLdapFilterDef || /^_/.test(a))
			continue;

		if (this._currentObject.attrs[a] != tmpObj.attrs[a] ) {
			mods[a] = tmpObj.attrs[a];
		}
	}
	//save the model
	var changeDetails = new Object();
	this._currentObject.modify(mods);
	//if modification took place - fire an DomainChangeEvent
	changeDetails["obj"] = this._currentObject;
	changeDetails["modFields"] = mods;
	this._fireSettingsChangeEvent(changeDetails);
	return true;
}

/**
*	Private method that notifies listeners to that the settings are changed
* 	@param details
*/
ZaGlobalConfigViewController.prototype._fireSettingsChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(ZaEvent.E_MODIFY)) {
			var evt = new ZaEvent(ZaEvent.S_GLOBALCONFIG);
			evt.set(ZaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(ZaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "ZaGlobalConfigViewController.prototype._fireSettingsChangeEvent", details, false);	
	}
}
