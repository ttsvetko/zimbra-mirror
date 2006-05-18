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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* @class ZaMTAXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function ZaMTAXFormView (parent, app) {
	ZaTabView.call(this, parent, app,"ZaMTAXFormView");	
		
	this.initForm(ZaMTA.myXModel,this.getMyXForm());
	this._localXForm.addListener(DwtEvent.XFORMS_FORM_DIRTY_CHANGE, new AjxListener(this, ZaMTAXFormView.prototype.handleXFormChange));	
	this._localXForm.setController(this._app);
}

ZaMTAXFormView.prototype = new ZaTabView();
ZaMTAXFormView.prototype.constructor = ZaMTAXFormView;
ZaTabView.XFormModifiers["ZaMTAXFormView"] = new Array();
ZaMTAXFormView.TAB_INDEX=1;
	ZaMTAXFormView._tab1 = ZaMTAXFormView.TAB_INDEX++;
	ZaMTAXFormView._tab2 = ZaMTAXFormView.TAB_INDEX++;	
	ZaMTAXFormView._tab3 = ZaMTAXFormView.TAB_INDEX++;	
	ZaMTAXFormView._tab4 = ZaMTAXFormView.TAB_INDEX++;	
	ZaMTAXFormView._tab5 = ZaMTAXFormView.TAB_INDEX++;	

ZaMTAXFormView.tabChoices = new XFormChoices([{value:ZaMTAXFormView._tab1, label:ZaMsg.PQV_Tab_Deferred},
				{value:ZaMTAXFormView._tab2, label:ZaMsg.PQV_Tab_IncomingQ},
				{value:ZaMTAXFormView._tab3, label:ZaMsg.PQV_Tab_ActiveQ},
				{value:ZaMTAXFormView._tab4, label:ZaMsg.PQV_Tab_HoldQ},					
				{value:ZaMTAXFormView._tab5, label:ZaMsg.PQV_Tab_CorruptQ}],
				XFormChoices.OBJECT_LIST, "value", "label");

ZaMTAXFormView.prototype.setObject = 
function (entry) {
	this._containedObject = entry;
	
	if(!entry[ZaModel.currentTab])
		this._containedObject[ZaModel.currentTab] = "1";
	else
		this._containedObject[ZaModel.currentTab] = entry[ZaModel.currentTab];
		
	ZaMTAXFormView.tabChoices.setChoices([
		{value:ZaMTAXFormView._tab1, label:ZaMsg.PQV_Tab_Deferred + " (" + this._containedObject[ZaMTA.A_DeferredQ][ZaMTA.A_count] + ")"},
		{value:ZaMTAXFormView._tab2, label:ZaMsg.PQV_Tab_IncomingQ + " (" + this._containedObject[ZaMTA.A_IncomingQ][ZaMTA.A_count] + ")"},
				{value:ZaMTAXFormView._tab3, label:ZaMsg.PQV_Tab_ActiveQ + " (" + this._containedObject[ZaMTA.A_ActiveQ][ZaMTA.A_count] + ")"},
				{value:ZaMTAXFormView._tab4, label:ZaMsg.PQV_Tab_HoldQ + " (" + this._containedObject[ZaMTA.A_HoldQ][ZaMTA.A_count] + ")"},					
				{value:ZaMTAXFormView._tab5, label:ZaMsg.PQV_Tab_CorruptQ + " (" + this._containedObject[ZaMTA.A_CorruptQ][ZaMTA.A_count] + ")"}]),

	ZaMTAXFormView.tabChoices.dirtyChoices();
	this._localXForm.setInstance(this._containedObject);	
	ZaMTAXFormView.prototype.handleXFormChange.call(this);
}
ZaMTAXFormView.prototype.handleXFormChange = function () {
	if(this._containedObject[ZaModel.currentTab] == "1" && (this._containedObject[ZaMTA.A_DeferredQ][ZaMTA.A_Status]==ZaMTA.STATUS_IDLE)) {
		this._containedObject.getMailQStatus(ZaMTA.A_DeferredQ, null, 0,null,true);	
	}
	if(this._containedObject[ZaModel.currentTab] == "2" && (this._containedObject[ZaMTA.A_IncomingQ][ZaMTA.A_Status]==ZaMTA.STATUS_IDLE)) {
		this._containedObject.getMailQStatus(ZaMTA.A_IncomingQ, null, 0,null,true);	
	}
	if(this._containedObject[ZaModel.currentTab] == "3" && (this._containedObject[ZaMTA.A_ActiveQ][ZaMTA.A_Status]==ZaMTA.STATUS_IDLE)) {
		this._containedObject.getMailQStatus(ZaMTA.A_ActiveQ, null, 0,null,true);	
	}
	if(this._containedObject[ZaModel.currentTab] == "4" && (this._containedObject[ZaMTA.A_HoldQ][ZaMTA.A_Status]==ZaMTA.STATUS_IDLE)) {
		this._containedObject.getMailQStatus(ZaMTA.A_HoldQ, null, 0,null,true);	
	}
	if(this._containedObject[ZaModel.currentTab] == "5" && (this._containedObject[ZaMTA.A_CorruptQ][ZaMTA.A_Status]==ZaMTA.STATUS_IDLE)) {
		this._containedObject.getMailQStatus(ZaMTA.A_CorruptQ, null, 0,null,true);	
	}				
}

ZaMTAXFormView._listObjects = {};

ZaMTAXFormView.filterListSelectionListener = function (ev) {
	//register this list in the map, so that we can deselect it later
	if(ev.dwtObj && this.refPath) {
		ZaMTAXFormView._listObjects[this.refPath] = ev.dwtObj;
	}
	var instance = this.getInstance();
	var refParts = this.getRef().split("/");
	var filterName = refParts[1];
	var qName = refParts[0];
	if(!instance[qName][ZaMTA.A_selection_cache])
		instance[qName][ZaMTA.A_selection_cache] = {};

	var arr = this.widget.getSelection();
	if(arr && arr.length)
		instance[qName][ZaMTA.A_selection_cache][filterName] = arr;
	else 
		instance[qName][ZaMTA.A_selection_cache][filterName] = null;
	
	//rebuild the query
	this.getForm().refresh();
	instance.getMailQStatus(qName, instance[qName][ZaMTA.A_selection_cache]);	
}

ZaMTAXFormView.msgListSelectionListener = function (ev) {
	//register this list in the map, so that we can deselect it later
	if(ev.dwtObj && this.refPath) {
		ZaMTAXFormView._listObjects[this.refPath] = ev.dwtObj;
	}
	var instance = this.getInstance();
	var refParts = this.getRef().split("/");

	var qName = refParts[0];
	if(!instance[qName][ZaMTA.MsgIDS])
		instance[qName][ZaMTA.MsgIDS] = {};

	instance[qName][ZaMTA.MsgIDS] = this.widget.getSelection();
}

ZaMTAXFormView.searchQueue = function (ev) {
	var instance = this.getInstance();
	var qName = this.getRef();
	//var query = instance[qName][ZaMTA.A_query];
	instance.getMailQStatus(qName, instance[qName][ZaMTA.A_selection_cache]);	
	
}
			
ZaMTAXFormView.clearFilter = 
function (ev) {
//	this.setInstanceValue("",this.getRef()+"/"+ZaMTA.A_queue_filter_name);
//	this.setInstanceValue("",this.getRef()+"/"+ZaMTA.A_queue_filter_value);	
	this.setInstanceValue("",this.getRef()+"/"+ZaMTA.A_selection_cache);	

	this.setInstanceValue("",this.getRef()+"/"+ZaMTA.A_query);		
	this.getForm().refresh();
	for(var x in ZaMTAXFormView._listObjects) {
		if(ZaMTAXFormView._listObjects[x]) {
			ZaMTAXFormView._listObjects[x].deselectAll();
		}
	}
}

ZaMTAXFormView.showAllMsgs = function (ev) {
	ZaMTAXFormView.clearFilter.call(this,ev);
	ZaMTAXFormView.searchQueue.call(this,ev);
}

ZaMTAXFormView.actionButtonListener = function (action) {
	var qName, field, dlgTitle,instance, app, form;
	qName = this.getRef();
	form = this.getForm();
	app = form.getController();			
	instance = this.getInstance();
	var obj = new Object();
	
	obj[ZaMTAActionDialog.QNAME]=qName;	
	switch(action) {
		case ZaMTA.ActionRequeue:
			dlgTitle = ZaMsg.PQ_REQ_DLG_TITLE;
			obj[ZaMTAActionDialog.MESSAGE]=ZaMsg.PQ_SELECT_WHAT_TO_REQ;
			obj[ZaMTAActionDialog.QUESTION]=ZaMsg.PQ_Q_REQUEUE_MESSAGES;
		break;
		case ZaMTA.ActionDelete:
			dlgTitle = ZaMsg.PQ_DEL_DLG_TITLE;
			obj[ZaMTAActionDialog.MESSAGE]=ZaMsg.PQ_SELECT_WHAT_TO_DEL;
			obj[ZaMTAActionDialog.QUESTION]=ZaMsg.PQ_Q_DELETE_MESSAGES;			
		break;
		case ZaMTA.ActionHold:
			dlgTitle = ZaMsg.PQ_HOLD_DLG_TITLE;
			obj[ZaMTAActionDialog.MESSAGE]=ZaMsg.PQ_SELECT_WHAT_TO_HOLD;
			obj[ZaMTAActionDialog.QUESTION]=ZaMsg.PQ_Q_HOLD_MESSAGES;			
		break;
		case ZaMTA.ActionRelease:
			dlgTitle = ZaMsg.PQ_REL_DLG_TITLE;
			obj[ZaMTAActionDialog.MESSAGE]=ZaMsg.PQ_SELECT_WHAT_TO_REL;
			obj[ZaMTAActionDialog.QUESTION]=ZaMsg.PQ_Q_RELEASE_MESSAGES;			
		break;
	}		
	var view = form.parent;
	view.selectActionDialog = app.dialogs["selectActionDialog"] = new ZaMTAActionDialog(app.getAppCtxt().getShell(), app, dlgTitle);	
	obj[ZaMTAActionDialog.MSG_IDS] = instance[qName][ZaMTA.MsgIDS];
	obj[ZaMTAActionDialog.FLTR_ITEMS] = instance[qName][ZaMTA.A_selection_cache];	
	obj[ZaMTAActionDialog.ANSWER] = ZaMTAActionDialog.SELECTED_MSGS; //default is selected messages
	obj[ZaMTAActionDialog.ACTION] = action;
	view.selectActionDialog.setObject(obj);
	view.selectActionDialog.registerCallback(DwtDialog.OK_BUTTON, view.actionDlgCallback, view, action);
	view.selectActionDialog.popup();
	
}

ZaMTAXFormView.prototype.actionDlgCallback = function(args)  {
	if(this.selectActionDialog) {
		var obj = this.selectActionDialog.getObject();
		var removeList;
		if(obj[ZaMTAActionDialog.ANSWER] == ZaMTAActionDialog.SELECTED_MSGS) {
			removeList = obj[ZaMTAActionDialog.MSG_IDS];
			if (removeList && removeList.length) {
				this.showConfirmationDlg(obj[ZaMTAActionDialog.ACTION],removeList, obj[ZaMTAActionDialog.QNAME],ZaMTA.A_messages);
			} else {
				this.selectActionDialog.popdown();
			}
		} else if(obj[ZaMTAActionDialog.ANSWER] == ZaMTAActionDialog.FLTRED_SET) {
			removeList = {};
			var field;
			if(obj[ZaMTAActionDialog.FLTR_ITEMS]) {
				for (var key in obj[ZaMTAActionDialog.FLTR_ITEMS]) {
					if(obj[ZaMTAActionDialog.FLTR_ITEMS][key]) {
						field = key;
						removeList[key] = obj[ZaMTAActionDialog.FLTR_ITEMS][key];
					}
				}
			}
			if(field) {
				this.showConfirmationDlg(obj[ZaMTAActionDialog.ACTION],removeList, obj[ZaMTAActionDialog.QNAME],field);
			} else {
				removeList = [];
				removeList[0] = {};
				removeList[0][ZaMTAQMsgItem.A_id] = ZaMTA.ID_ALL;
				this.showConfirmationDlg(obj[ZaMTAActionDialog.ACTION],removeList, obj[ZaMTAActionDialog.QNAME],ZaMTA.A_messages);
			}
		}
	}
}

ZaMTAXFormView.prototype.showConfirmationDlg = function (action, removelist,qName, field) {
	this.confirmMessageDialog = this._app.dialogs["confirmMessageDialog"] = new ZaMsgDialog(this._app.getAppCtxt().getShell(), null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);			
	if(removelist) {
		if(field == ZaMTA.A_messages) {
			var subst = "0";
			if(removelist.length) {
				if(removelist[0][ZaMTAQMsgItem.A_id]==ZaMTA.ID_ALL) {
					subst = ZaMsg.PQ_AllMessages;
				} else {
					subst = String(removelist.length);
				}
			}
			switch(action) {
				case ZaMTA.ActionRequeue:
					dlgMsg = String(ZaMsg.PQ_Q_REQUEUE_MESSAGES).replace("{0}", subst).replace("{1}",qName);
				break;
				case ZaMTA.ActionDelete:
					dlgMsg = String(ZaMsg.PQ_Q_DELETE_MESSAGES).replace("{0}", subst).replace("{1}",qName);
				break;
				case ZaMTA.ActionHold:
					dlgMsg = String(ZaMsg.PQ_Q_HOLD_MESSAGES).replace("{0}", subst).replace("{1}",qName);				
				break;
				case ZaMTA.ActionRelease:
					dlgMsg = String(ZaMsg.PQ_Q_RELEASE_MESSAGES).replace("{0}", subst).replace("{1}",qName);								
				break;
			}
		} else {
			switch(action) {
				case ZaMTA.ActionRequeue:
					dlgMsg = ZaMsg.PQ_Q_REQUEUE_MESSAGES2;
				break;
				case ZaMTA.ActionDelete:
					dlgMsg = ZaMsg.PQ_Q_DELETE_MESSAGES2;
				break;
				case ZaMTA.ActionHold:
					dlgMsg = ZaMsg.PQ_Q_HOLD_MESSAGES2;
				break;
				case ZaMTA.ActionRelease:
					dlgMsg = ZaMsg.PQ_Q_RELEASE_MESSAGES2;
				break;
			}		
			dlgMsg +=  "<br><ul>";
			var i=0;
			for(var key in removelist) {
				if(removelist[key]) {
					var cnt = removelist[key].length;
					dlgMsg += "<li>";
					dlgMsg += key;
					dlgMsg += "<ul>";
					for(var j=0; j < cnt; j++) {
						if(i > 19) {
							dlgMsg += "<li>...</li>";
							break;
						}
						dlgMsg += "<li>";
								dlgMsg += removelist[key][j][ZaMTAQSummaryItem.A_text];
						dlgMsg += (" (" + removelist[key][j][ZaMTAQSummaryItem.A_count] + " " + ZaMsg.messages + ")");
						dlgMsg += "</li>";						
						i++;
					}
					dlgMsg += "</ul></li>";
				}
			}
		}
		dlgMsg += "</ul>";
		if(field == ZaMTA.A_messages) {
			this.confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, this.actionMsgsByIDCallback, this, {action:action,removelist:removelist, qName:qName, field:field});
		} else {
			this.confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, this.actionMsgsByQueryCallback, this,{action:action,removelist:removelist, qName:qName, field:field});
		}
	}
	if(dlgMsg) {
		this.confirmMessageDialog.setMessage(dlgMsg,  DwtMessageDialog.INFO_STYLE);
	}
	this.confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, this.doNotCallback, this);		
	this.confirmMessageDialog.popup();	
}

ZaMTAXFormView.popupMenuListener = function (action) {
	var qName, field, removeList;
	if(this.xFormItem) {
		var refParts = this.xFormItem.getRef().split("/");
		qName = refParts[0];
		if(refParts.length > 1)
			field = refParts[1];
	} 	

	var view = this.xFormItem.getForm().parent;
	if(field == ZaMTA.A_messages) {
		var removeList = new Array();
		if(this.getSelectionCount()>0) {
			removeList = this.getSelection();
		}
	} else  {
		var removeList = {};
		removeList[field] = new Array();
		if(this.getSelectionCount()>0) {
			removeList[field] = this.getSelection();
		}		
	}
	view.showConfirmationDlg(action, removeList, qName, field);
}

ZaMTAXFormView.prototype.actionMsgsByIDCallback = function (args) {
	var arr = [], action, qName,removelist;
	action = args.action;
	removelist = args.removelist;
	qName = args.qName;
	for(var key in removelist) {
		arr.push(removelist[key][ZaMTAQMsgItem.A_id])
	}
	if(arr.length > 0) {
	/*	if(this.xFormItem) {
			instance = this.xFormItem.getInstance();
			var refParts = this.xFormItem.getRef().split("/");
			qName = refParts[0];
		} else {
			instance = this.getInstance();
			qName = this.getRef();
		}*/
		this._containedObject.mailQueueAction(qName, action, "id", arr.join(","));
	}
	this.confirmMessageDialog.popdown();
	if(this.selectActionDialog)
		this.selectActionDialog.popdown();
}

ZaMTAXFormView.prototype.actionMsgsByQueryCallback = function (args) {
	var arr = [], action, removelist, qName, field;
	action = args.action;
	removelist = args.removelist;
	qName = args.qName;
	field = args.field;
	//var joinStr = "\" OR \"";
	/*for(var key in removelist) {
		if(removelist[key]) {
			var cnt = removelist[key].length;
			for(var i = 0; i < cnt; i++) {
				arr.push(removelist[key][i]);
			}
		}
		
	}*/
//	if(arr.length > 0) {
//		var query = "";
	/*	if(this.xFormItem) {
			instance = this.xFormItem.getInstance();
			var refParts = this.xFormItem.getRef().split("/");
			qName = refParts[0];
		} else {
			instance = this.getInstance();
			qName = this.getRef();
		}*/		
		//var filterName = refParts[1];
		//query = filterName + ":(\"" + arr.join(joinStr) + "\")";
		//var query = new Object();
		//query[field] = arr;
		this._containedObject.mailQueueAction(qName, action, "query", removelist);
	//}
	this.confirmMessageDialog.popdown();
	if(this.selectActionDialog)
		this.selectActionDialog.popdown();
}

ZaMTAXFormView.prototype.doNotCallback = function () {
	if(this.confirmMessageDialog)
		this.confirmMessageDialog.popdown();
}


ZaMTAXFormView.backMsgsButtonHndlr = function (ev) {
	var instance = this.getInstance();
	var qName = this.getRef();
	var currentPage = this.getInstanceValue(this.getRef()+"/"+ZaMTA.A_pageNum);

	if (currentPage)
		currentPage--;
	else 
		currentPage = 0;
			
	instance.getMailQStatus(qName, instance[qName][ZaMTA.A_selection_cache],currentPage*ZaMTA.RESULTSPERPAGE);
}

ZaMTAXFormView.fwdMsgsButtonHndlr = function (ev) {
	var instance = this.getInstance();
	var qName = this.getRef();
	var currentPage = this.getInstanceValue(this.getRef()+"/"+ZaMTA.A_pageNum);
	if (currentPage)
		currentPage++;
	else 
		currentPage = 1;

	instance.getMailQStatus(qName, instance[qName][ZaMTA.A_selection_cache],currentPage*ZaMTA.RESULTSPERPAGE);
}

ZaMTAXFormView.listActionListener = function (ev) {
	this.actionMenu.popup(0, ev.docX, ev.docY);	
}

ZaMTAXFormView.refreshListener = function (ev) {
	var refParts = this.getRef().split("/");
	var filterName = refParts[1];
	var qName = refParts[0];
	ZaMTAXFormView.clearFilter.call(this,ev);	
	this.getInstance().getMailQStatus(qName,null,null,null,true);
	this.getInstance().load();
}

ZaMTAXFormView.createPopupMenu = function (listWidget) {
	popupOperations = [new ZaOperation(ZaOperation.DELETE, ZaMsg.TBB_Delete, ZaMsg.PQ_Delete_tt, null, null, new AjxListener(listWidget, ZaMTAXFormView.popupMenuListener, ZaMTA.ActionDelete)),
	new ZaOperation(ZaOperation.REQUEUE, ZaMsg.TBB_Requeue, ZaMsg.PQ_Requeue_tt, null, null, new AjxListener(listWidget, ZaMTAXFormView.popupMenuListener,ZaMTA.ActionRequeue ))];

	var refParts = this.getRef().split("/");
	var qName = refParts[0];
	if(qName == ZaMTA.A_HoldQ) {
		popupOperations.push(new ZaOperation(ZaOperation.RELEASE, ZaMsg.TBB_Release, ZaMsg.PQ_Release_tt, null, null, new AjxListener(listWidget, ZaMTAXFormView.popupMenuListener,ZaMTA.ActionRelease)));
	} else {
		popupOperations.push(new ZaOperation(ZaOperation.HOLD, ZaMsg.TBB_Hold, ZaMsg.PQ_Hold_tt, null, null, new AjxListener(listWidget, ZaMTAXFormView.popupMenuListener,ZaMTA.ActionHold )));
	}
	listWidget.actionMenu = new ZaPopupMenu(listWidget, "ActionMenu", null, popupOperations);
	listWidget.addActionListener(new AjxListener(listWidget, ZaMTAXFormView.listActionListener));		
	listWidget.xFormItem = this;
}

/**
* method of the XForm
**/
ZaMTAXFormView.shouldEnableMsgsForwardButton = function (qName) {
	return (this.instance[qName][ZaMTA.A_more]);
};

/**
* method of the XForm
**/
ZaMTAXFormView.shouldEnableMsgsBackButton = function (qName) {
	var val = this.instance[qName][ZaMTA.A_pageNum];
	return (val && (val>0));
};

ZaMTAXFormView.myXFormModifier = function(xFormObject) {	
	xFormObject.tableCssStyle="width:100%;position:static;overflow:auto;";
	
	
	var headerList = new Array();
	headerList[0] = new ZaListHeaderItem(ZaMTAQSummaryItem.A_text_col, ZaMsg.PQV_name_col, null, null, false, null, false, true);
	headerList[1] = new ZaListHeaderItem(ZaMTAQSummaryItem.A_count_col, ZaMsg.PQV_count_col, null, "30px", false, null, false, true);
	headerList[2] = new ZaListHeaderItem(null, null, null, null, null, null, false, true);							
		
	var msgHeaderList = new Array();
	msgHeaderList[0] = new ZaListHeaderItem(ZaMTAQMsgItem.A_id, ZaMsg.PQV_qid_col, null, "100px", null, null, false, true);
	msgHeaderList[1] = new ZaListHeaderItem(ZaMTAQMsgItem.A_recipients, ZaMsg.PQV_recipients_col, null, "106px", null, null, false, true);
	msgHeaderList[2] = new ZaListHeaderItem(ZaMTAQMsgItem.A_sender, ZaMsg.PQV_sender_col, null, "106px", null, null, false, true);		
	msgHeaderList[3] = new ZaListHeaderItem(ZaMTAQMsgItem.A_origin_ip, ZaMsg.PQV_origin_ip_col, null, "97px", null, null, false, true);	
	msgHeaderList[4] = new ZaListHeaderItem(ZaMTAQMsgItem.A_origin_host, ZaMsg.PQV_origin_host_col, null, "103px", null, null, false, true);			
	msgHeaderList[5] = new ZaListHeaderItem(ZaMTAQMsgItem.A_fromdomain, ZaMsg.PQV_origin_domain_col, null, "106px", null, null, false, true);		
	msgHeaderList[6] = new ZaListHeaderItem(ZaMTAQMsgItem.A_content_filter, ZaMsg.PQV_content_filter_col, "103px", null, null, null, false, true);				
	msgHeaderList[7] = new ZaListHeaderItem(ZaMTAQMsgItem.A_time, ZaMsg.PQV_time_col, null, "78px", null, null, false, true);					
	msgHeaderList[8] = new ZaListHeaderItem(null, null, null, null, null, null, false, true);						

	xFormObject.items = [
		{type:_GROUP_, cssClass:"ZmSelectedHeaderBg", colSpan: "*", 
			items: [
				{type:_GROUP_,	numCols:6,colSizes:["32px","250px","auto", "130px","250px", "auto"],
					items: [
						{type:_AJX_IMAGE_, src:"Queue_32", label:null},
						{type:_OUTPUT_, ref:ZaMTA.A_name, label:null,cssClass:"AdminTitle"},
						{type:_CELLSPACER_},
						{type:_CELLSPACER_},
						{type:_CELLSPACER_}						
					]
				}
			],
			cssStyle:"padding-top:5px; padding-bottom:5px"
		},
		{type:_TAB_BAR_, ref:ZaModel.currentTab,
			relevantBehavior:_HIDE_,
			containerCssStyle: "padding-top:0px",
			choices:ZaMTAXFormView.tabChoices,
			cssClass:"ZaTabBar"
		},
		{type:_SWITCH_, items:[
				{type:_CASE_, numCols:1, cssClass:(AjxEnv.isIE ? "IEcontainer" : ""), width:"100%",/*colSizes:["10", "250","10","250","10"], */relevant:"instance[ZaModel.currentTab] == " + ZaMTAXFormView._tab1, 
					items:[	
						{type:_SPACER_, height:"15"},
						{type:_GROUP_,numCols:8, colSizes:["10%", "10%","10%", "18%", "12%", "25%", "auto", "10%"],tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_OUTPUT_, label:ZaMsg.TBB_LastUpdated, ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_refreshTime},
							{type:_OUTPUT_, label:ZaMsg.PQ_AnalyzerStatus, ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_Status,choices:ZaMTA.SCANNER_STATUS_CHOICES},
							{type:_DWT_PROGRESS_BAR_,label:ZaMsg.PQ_ParsingProgress,
								maxValue:null,
								maxValueRef:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_count,
								ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_totalComplete,
								relevant:"instance[ZaMTA.A_DeferredQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCANNING || instance[ZaMTA.A_DeferredQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCAN_COMPLETE",
								relevantBehavior:_HIDE_,
								align:_CENTER_,	
								wholeCssClass:"mtaprogressbar",
								progressCssClass:"progressused"
							},
							{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_DeferredQ, label:ZaMsg.PQ_AnalyzeQueue,onActivate:ZaMTAXFormView.refreshListener}							
						]},								
						{type:_SPACER_, height:"1"},							
						{type:_GROUP_, numCols:11, /*cssStyle:(AjxEnv.isIE ? "width:98%" : ""),*/ colSizes:["auto","2px", "auto","2px", "auto", "2px", "auto", "2px", "auto", "2px", "auto"],cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%", items: [						
						    {type:_GROUP_, colSpan:11, numCols:1, 
						   		items: [
									{type:_OUTPUT_, value:ZaMsg.PQV_Summary, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
								]
							},
													
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table",  items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupRDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_rdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu, preserveSelection:true, multiselect:true,onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupOriginIP, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_origip, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,preserveSelection:true, multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_sdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},	
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupReceiverAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_raddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_saddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},							
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupError, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_error, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							}						
						]},
						{type:_SPACER_, height:"15"},	
																
						{type:_GROUP_, numCols:1, cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%",  items: [
							   {type:_GROUP_, numCols:1, 
							   		items: [
										{type:_OUTPUT_, value:ZaMsg.PQV_Messages, cssClass: "RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
									]
						},
						{type:_GROUP_, numCols:9, tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_DWT_BUTTON_,ref:ZaMTA.A_DeferredQ, label:ZaMsg.TBB_RequeueAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRequeue);",toolTipContent:ZaMsg.PQ_Requeue_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_DeferredQ, label:ZaMsg.TBB_HoldAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionHold);",toolTipContent:ZaMsg.PQ_Hold_tt},{type:_CELLSPACER_},							
							{type:_DWT_BUTTON_,ref:ZaMTA.A_DeferredQ, label:ZaMsg.PQ_DeleteAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionDelete);" ,toolTipContent:ZaMsg.PQ_Delete_tt},{type:_CELLSPACER_},							
							{type:_DWT_BUTTON_, label:ZaMsg.PQ_showAllMsgs, ref:ZaMTA.A_DeferredQ, onActivate:ZaMTAXFormView.showAllMsgs},
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:3, items:[
								{type:_DWT_BUTTON_, label:ZaMsg.Previous,toolTipContent:ZaMsg.PrevPage_tt, width:75, id:"backButton", icon:"LeftArrow", disIcon:"LeftArrowDis", 	
									ref:ZaMTA.A_DeferredQ,
									onActivate:"ZaMTAXFormView.backMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsBackButton.call(this,\"" +ZaMTA.A_DeferredQ +"\")")
							    },								       
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.Next,toolTipContent:ZaMsg.NextPage_tt, width:75, id:"fwdButton", icon:"RightArrow", disIcon:"RightArrowDis",	
									ref:ZaMTA.A_DeferredQ,labelLocation:(DwtLabel.IMAGE_RIGHT | DwtLabel.ALIGN_CENTER),
									onActivate:"ZaMTAXFormView.fwdMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsForwardButton.call(this,\"" + ZaMTA.A_DeferredQ+"\")")
							    }]
							 }
						]},			
					    {ref:ZaMTA.A_DeferredQ+"/"+ZaMTA.A_messages, onSelection:ZaMTAXFormView.msgListSelectionListener, type:_DWT_LIST_, height:"200", width:"100%", cssClass: "DLSource",
						   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, widgetClass:ZaQMessagesListView, headerList:msgHeaderList},								
							]
						}		
					]
				},							
				{type:_CASE_, numCols:1, cssClass:(AjxEnv.isIE ? "IEcontainer" : ""), width:"100%",/*colSizes:["10", "250","10","250","10"], */relevant:"instance[ZaModel.currentTab] == " + ZaMTAXFormView._tab2, 
					items:[	
						{type:_SPACER_, height:"15"},
						{type:_GROUP_,numCols:8, colSizes:["10%", "10%","10%", "18%", "12%", "25%", "auto", "10%"],tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_OUTPUT_, label:ZaMsg.TBB_LastUpdated, ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_refreshTime},
							{type:_OUTPUT_, label:ZaMsg.PQ_AnalyzerStatus, ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_Status,choices:ZaMTA.SCANNER_STATUS_CHOICES},
							{type:_DWT_PROGRESS_BAR_,label:ZaMsg.PQ_ParsingProgress,
								maxValue:null,
								maxValueRef:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_count,
								ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_totalComplete,
								relevant:"instance[ZaMTA.A_IncomingQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCANNING || instance[ZaMTA.A_IncomingQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCAN_COMPLETE",
								relevantBehavior:_HIDE_,
								align:_CENTER_,	
								wholeCssClass:"mtaprogressbar",
								progressCssClass:"progressused"
							},
							{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_IncomingQ, label:ZaMsg.PQ_AnalyzeQueue,onActivate:ZaMTAXFormView.refreshListener}													
						]},							
						{type:_SPACER_, height:"1"},							
						{type:_GROUP_, numCols:9, /*cssStyle:(AjxEnv.isIE ? "width:98%" : ""),*/ colSizes:["auto","2px", "auto","2px", "auto", "2px", "auto", "2px", "auto"],cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%", items: [						
						    {type:_GROUP_, colSpan:9, numCols:1, 
						   		items: [
									{type:_OUTPUT_, value:ZaMsg.PQV_Summary, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
								]
							},
													
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table",  items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupRDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_rdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu, preserveSelection:true, multiselect:true,onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupOriginIP, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_origip, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,preserveSelection:true, multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_sdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},	
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupReceiverAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_raddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_saddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							}						
						]},
						{type:_SPACER_, height:"15"},	
						{type:_GROUP_, numCols:1, cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%",  items: [
							   {type:_GROUP_, numCols:1, 
							   		items: [
										{type:_OUTPUT_, value:ZaMsg.PQV_Messages, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
									]
						},
						{type:_GROUP_, numCols:9, tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_DWT_BUTTON_,ref:ZaMTA.A_IncomingQ, label:ZaMsg.TBB_RequeueAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRequeue)",toolTipContent:ZaMsg.PQ_Requeue_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_IncomingQ, label:ZaMsg.TBB_HoldAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionHold)",toolTipContent:ZaMsg.PQ_Hold_tt},{type:_CELLSPACER_},	
							{type:_DWT_BUTTON_,ref:ZaMTA.A_IncomingQ, label:ZaMsg.PQ_DeleteAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionDelete)",toolTipContent:ZaMsg.PQ_Delete_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_, label:ZaMsg.PQ_showAllMsgs, ref:ZaMTA.A_IncomingQ, onActivate:ZaMTAXFormView.showAllMsgs},
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:3, items:[
								{type:_DWT_BUTTON_, label:ZaMsg.Previous,toolTipContent:ZaMsg.PrevPage_tt, width:75, id:"backButton", icon:"LeftArrow", disIcon:"LeftArrowDis", 	
									ref:ZaMTA.A_IncomingQ,
									onActivate:"ZaMTAXFormView.backMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsBackButton.call(this,\"" +ZaMTA.A_IncomingQ +"\")")
							    },								       
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.Next,toolTipContent:ZaMsg.NextPage_tt, width:75, id:"fwdButton", icon:"RightArrow", disIcon:"RightArrowDis",	
									ref:ZaMTA.A_IncomingQ,labelLocation:(DwtLabel.IMAGE_RIGHT | DwtLabel.ALIGN_CENTER),
									onActivate:"ZaMTAXFormView.fwdMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsForwardButton.call(this,\"" + ZaMTA.A_IncomingQ+"\")")
							    }]
							}														
						]},										
					    {ref:ZaMTA.A_IncomingQ+"/"+ZaMTA.A_messages, onSelection:ZaMTAXFormView.msgListSelectionListener, type:_DWT_LIST_, height:"200", width:"100%", cssClass: "DLSource", 
						   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, widgetClass:ZaQMessagesListView, headerList:msgHeaderList},								
							]
						}		
					]
				},
				{type:_CASE_, numCols:1, cssClass:(AjxEnv.isIE ? "IEcontainer" : ""), width:"100%",relevant:"instance[ZaModel.currentTab] == " + ZaMTAXFormView._tab3, 
					items:[	
						{type:_SPACER_, height:"15"},
						{type:_GROUP_,numCols:8, colSizes:["10%", "10%","10%", "18%", "12%", "25%", "auto", "10%"],tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_OUTPUT_, label:ZaMsg.TBB_LastUpdated, ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_refreshTime},
							{type:_OUTPUT_, label:ZaMsg.PQ_AnalyzerStatus, ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_Status,choices:ZaMTA.SCANNER_STATUS_CHOICES},							
							{type:_DWT_PROGRESS_BAR_,label:ZaMsg.PQ_ParsingProgress,
								maxValue:null,
								maxValueRef:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_count,
								ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_totalComplete,
								relevant:"instance[ZaMTA.A_ActiveQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCANNING || instance[ZaMTA.A_ActiveQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCAN_COMPLETE",
								relevantBehavior:_HIDE_,
								align:_CENTER_,	
								wholeCssClass:"mtaprogressbar",
								progressCssClass:"progressused"
							},
							{type:_CELLSPACER_},							
							{type:_DWT_BUTTON_,ref:ZaMTA.A_ActiveQ, label:ZaMsg.PQ_AnalyzeQueue,onActivate:ZaMTAXFormView.refreshListener}
						]},								
						{type:_SPACER_, height:"1"},							
						{type:_GROUP_, numCols:9, colSizes:["auto","2px", "auto","2px", "auto", "2px", "auto", "2px", "auto"],cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%", items: [						
						    {type:_GROUP_, colSpan:9, numCols:1, 
						   		items: [
									{type:_OUTPUT_, value:ZaMsg.PQV_Summary, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
								]
							},
													
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table",  items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupRDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_rdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu, preserveSelection:true, multiselect:true,onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupOriginIP, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_origip, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,preserveSelection:true, multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_sdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},	
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupReceiverAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_raddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_saddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							}						
						]},
						{type:_SPACER_, height:"15"},	
						{type:_GROUP_, numCols:1, cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%",  items: [
							   {type:_GROUP_, numCols:1, 
							   		items: [
										{type:_OUTPUT_, value:ZaMsg.PQV_Messages, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
									]
						},
	
						{type:_GROUP_, numCols:9, tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_DWT_BUTTON_,ref:ZaMTA.A_ActiveQ, label:ZaMsg.TBB_RequeueAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRequeue)",toolTipContent:ZaMsg.PQ_Requeue_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_ActiveQ, label:ZaMsg.TBB_HoldAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionHold)",toolTipContent:ZaMsg.PQ_Hold_tt},{type:_CELLSPACER_},	
							{type:_DWT_BUTTON_,ref:ZaMTA.A_ActiveQ, label:ZaMsg.PQ_DeleteAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionDelete)",toolTipContent:ZaMsg.PQ_Delete_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_, label:ZaMsg.PQ_showAllMsgs, ref:ZaMTA.A_ActiveQ, onActivate:ZaMTAXFormView.showAllMsgs},
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:3, items:[					
								{type:_DWT_BUTTON_, label:ZaMsg.Previous,toolTipContent:ZaMsg.PrevPage_tt, width:75, id:"backButton", icon:"LeftArrow", disIcon:"LeftArrowDis", 	
									ref:ZaMTA.A_ActiveQ,
									onActivate:"ZaMTAXFormView.backMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsBackButton.call(this,\"" +ZaMTA.A_ActiveQ +"\")")
							    },								       
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.Next,toolTipContent:ZaMsg.NextPage_tt, width:75, id:"fwdButton", icon:"RightArrow", disIcon:"RightArrowDis",	
									ref:ZaMTA.A_ActiveQ,labelLocation:(DwtLabel.IMAGE_RIGHT | DwtLabel.ALIGN_CENTER),
									onActivate:"ZaMTAXFormView.fwdMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsForwardButton.call(this,\"" + ZaMTA.A_ActiveQ+"\")")
							    }]
							 }
						]},									
						{ref:ZaMTA.A_ActiveQ+"/"+ZaMTA.A_messages, onSelection:ZaMTAXFormView.msgListSelectionListener, type:_DWT_LIST_, height:"200", width:"100%", cssClass: "DLSource", 
						   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, widgetClass:ZaQMessagesListView, headerList:msgHeaderList},								
							]
						}		
					]
				},
				{type:_CASE_, numCols:1, cssClass:(AjxEnv.isIE ? "IEcontainer" : ""), width:"100%",relevant:"instance[ZaModel.currentTab] == " + ZaMTAXFormView._tab4, 
					items:[	
						{type:_SPACER_, height:"15"},
						{type:_GROUP_,numCols:8, colSizes:["10%", "10%","10%", "18%", "12%", "25%", "auto", "10%"],tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_OUTPUT_, label:ZaMsg.TBB_LastUpdated, ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_refreshTime},
							{type:_OUTPUT_, label:ZaMsg.PQ_AnalyzerStatus, ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_Status,choices:ZaMTA.SCANNER_STATUS_CHOICES},							
							{type:_DWT_PROGRESS_BAR_,label:ZaMsg.PQ_ParsingProgress,
								maxValue:null,
								maxValueRef:ZaMTA.A_HoldQ+"/"+ZaMTA.A_count,
								ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_totalComplete,
								relevant:"instance[ZaMTA.A_HoldQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCANNING || instance[ZaMTA.A_HoldQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCAN_COMPLETE",
								relevantBehavior:_HIDE_,
								align:_CENTER_,	
								wholeCssClass:"mtaprogressbar",
								progressCssClass:"progressused"
							},
							{type:_CELLSPACER_},							
							{type:_DWT_BUTTON_,ref:ZaMTA.A_HoldQ, label:ZaMsg.PQ_AnalyzeQueue,onActivate:ZaMTAXFormView.refreshListener}
						]},							
						{type:_SPACER_, height:"1"},							
						{type:_GROUP_, numCols:9, colSizes:["auto","2px", "auto","2px", "auto", "2px", "auto", "2px", "auto"],cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%", items: [						
						    {type:_GROUP_, colSpan:9, numCols:1, 
						   		items: [
									{type:_OUTPUT_, value:ZaMsg.PQV_Summary, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
								]
							},
													
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table",  items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupRDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_rdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu, preserveSelection:true, multiselect:true,onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupOriginIP, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_origip, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,preserveSelection:true, multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_sdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},	
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupReceiverAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_raddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_saddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							}						
						]},
						{type:_SPACER_, height:"15"},	
						{type:_GROUP_, numCols:1, cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%",  items: [
							   {type:_GROUP_, numCols:1, 
							   		items: [
										{type:_OUTPUT_, value:ZaMsg.PQV_Messages, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
									]
						},
						{type:_GROUP_, numCols:9, tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_DWT_BUTTON_,ref:ZaMTA.A_HoldQ, label:ZaMsg.TBB_RequeueAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRequeue)",toolTipContent:ZaMsg.PQ_Requeue_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_HoldQ, label:ZaMsg.TBB_ReleaseAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRelease)",toolTipContent:ZaMsg.PQ_Release_tt},{type:_CELLSPACER_},	
							{type:_DWT_BUTTON_,ref:ZaMTA.A_HoldQ, label:ZaMsg.PQ_DeleteAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionDelete)",toolTipContent:ZaMsg.PQ_Delete_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_, label:ZaMsg.PQ_showAllMsgs, ref:ZaMTA.A_HoldQ, onActivate:ZaMTAXFormView.showAllMsgs},
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:3, items:[								
								{type:_DWT_BUTTON_, label:ZaMsg.Previous,toolTipContent:ZaMsg.PrevPage_tt, width:75, id:"backButton", icon:"LeftArrow", disIcon:"LeftArrowDis", 	
									ref:ZaMTA.A_HoldQ,
									onActivate:"ZaMTAXFormView.backMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsBackButton.call(this,\"" +ZaMTA.A_HoldQ +"\")")
							    },								       
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.Next,toolTipContent:ZaMsg.NextPage_tt, width:75, id:"fwdButton", icon:"RightArrow", disIcon:"RightArrowDis",	
									ref:ZaMTA.A_HoldQ,labelLocation:(DwtLabel.IMAGE_RIGHT | DwtLabel.ALIGN_CENTER),
									onActivate:"ZaMTAXFormView.fwdMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsForwardButton.call(this,\"" + ZaMTA.A_HoldQ+"\")")
							    }]
							}
						]},								
					    {ref:ZaMTA.A_HoldQ+"/"+ZaMTA.A_messages, onSelection:ZaMTAXFormView.msgListSelectionListener, type:_DWT_LIST_, height:"200", width:"100%", cssClass: "DLSource", 
						   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, widgetClass:ZaQMessagesListView, headerList:msgHeaderList},								
							]
						}		
					]
				},											
					
				{type:_CASE_, numCols:1, cssClass:(AjxEnv.isIE ? "IEcontainer" : ""), width:"100%",relevant:"instance[ZaModel.currentTab] == " + ZaMTAXFormView._tab5, 
					items:[	
						{type:_SPACER_, height:"15"},
						
						{type:_GROUP_,numCols:8, colSizes:["10%", "10%","10%", "18%", "12%", "25%", "auto", "10%"],tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_OUTPUT_, label:ZaMsg.TBB_LastUpdated, ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_refreshTime},
							{type:_OUTPUT_, label:ZaMsg.PQ_AnalyzerStatus, ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_Status,choices:ZaMTA.SCANNER_STATUS_CHOICES},							
							{type:_DWT_PROGRESS_BAR_,label:ZaMsg.PQ_ParsingProgress,
								maxValue:null,
								maxValueRef:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_count,
								ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_totalComplete,
								relevant:"instance[ZaMTA.A_CorruptQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCANNING || instance[ZaMTA.A_CorruptQ][ZaMTA.A_Status] == ZaMTA.STATUS_SCAN_COMPLETE",
								relevantBehavior:_HIDE_,
								align:_CENTER_,	
								wholeCssClass:"mtaprogressbar",
								progressCssClass:"progressused"
							},
							{type:_CELLSPACER_},							
							{type:_DWT_BUTTON_,ref:ZaMTA.A_CorruptQ, label:ZaMsg.PQ_AnalyzeQueue,onActivate:ZaMTAXFormView.refreshListener}
						]},							
						{type:_SPACER_, height:"1"},							
						{type:_GROUP_, numCols:9, colSizes:["auto","2px", "auto","2px", "auto", "2px", "auto", "2px", "auto"],cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%", items: [						
						    {type:_GROUP_, colSpan:9, numCols:1, 
						   		items: [
									{type:_OUTPUT_, value:ZaMsg.PQV_Summary, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
								]
							},
													
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table",  items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupRDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_rdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu, preserveSelection:true, multiselect:true,onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupOriginIP, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_origip, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,preserveSelection:true, multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderDomain, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_sdomain, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},	
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupReceiverAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_raddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							},		
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:1,cssClass:"RadioGrouperBorder", tableCssClass:"que_table", items: [
								   {type:_GROUP_, numCols:1, 
								   		items: [
											{type:_OUTPUT_, value:ZaMsg.PQV_GroupSenderAddress, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
										]
									},
								    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_saddress, type:_DWT_LIST_, height:"150", width:"100%", cssClass: "DLSource", 
							   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, onSelection:ZaMTAXFormView.filterListSelectionListener, widgetClass:ZaQSummaryListView, headerList:headerList},								
								]
							}						
						]},
						{type:_SPACER_, height:"15"},	
						{type:_GROUP_, numCols:1, cssClass:(AjxEnv.isIE ? "RadioGrouperBorder IEcontainer" : "RadioGrouperBorder FFcontainer"), tableCssStyle:"width:100%",  items: [
							   {type:_GROUP_, numCols:1, 
							   		items: [
										{type:_OUTPUT_, value:ZaMsg.PQV_Messages, cssClass:"RadioGrouperLabel"/*(AjxEnv.isIE ? "" : "RadioGrouperLabel")*/, cssStyle:"z-index:"+(Dwt.Z_VIEW+1)}
									]
						},
						{type:_GROUP_, numCols:9, tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", items: [
							{type:_DWT_BUTTON_,ref:ZaMTA.A_CorruptQ, label:ZaMsg.TBB_RequeueAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionRequeue)",toolTipContent:ZaMsg.PQ_Requeue_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_,ref:ZaMTA.A_CorruptQ, label:ZaMsg.TBB_HoldAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionHold)",toolTipContent:ZaMsg.PQ_Hold_tt},{type:_CELLSPACER_},	
							{type:_DWT_BUTTON_,ref:ZaMTA.A_CorruptQ, label:ZaMsg.PQ_DeleteAll,onActivate:"ZaMTAXFormView.actionButtonListener.call(this,ZaMTA.ActionDelete)",toolTipContent:ZaMsg.PQ_Delete_tt},{type:_CELLSPACER_},
							{type:_DWT_BUTTON_, label:ZaMsg.PQ_showAllMsgs, ref:ZaMTA.A_CorruptQ, onActivate:ZaMTAXFormView.showAllMsgs},
							{type:_CELLSPACER_},
							{type:_GROUP_, numCols:3, items:[
								{type:_DWT_BUTTON_, label:ZaMsg.Previous,toolTipContent:ZaMsg.PrevPage_tt, width:75, id:"backButton", icon:"LeftArrow", disIcon:"LeftArrowDis", 	
									ref:ZaMTA.A_CorruptQ,
									onActivate:"ZaMTAXFormView.backMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsBackButton.call(this,\"" +ZaMTA.A_CorruptQ +"\")")
							    },								       
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.Next,toolTipContent:ZaMsg.NextPage_tt, width:75, id:"fwdButton", icon:"RightArrow", disIcon:"RightArrowDis",	
									ref:ZaMTA.A_CorruptQ,labelLocation:(DwtLabel.IMAGE_RIGHT | DwtLabel.ALIGN_CENTER),
									onActivate:"ZaMTAXFormView.fwdMsgsButtonHndlr.call(this,event)", 
									relevantBehavior:_DISABLE_, relevant:("ZaMTAXFormView.shouldEnableMsgsForwardButton.call(this,\"" + ZaMTA.A_CorruptQ+"\")")
							    }]
							 }					
						]},									
					    {ref:ZaMTA.A_CorruptQ+"/"+ZaMTA.A_messages, onSelection:ZaMTAXFormView.msgListSelectionListener, type:_DWT_LIST_, height:"200", width:"100%", cssClass: "DLSource", 
						   		forceUpdate: false,createPopupMenu:ZaMTAXFormView.createPopupMenu,multiselect:true, widgetClass:ZaQMessagesListView, headerList:msgHeaderList},								
							]
						}		
					]
				}											
			]
		}
	]
};
ZaTabView.XFormModifiers["ZaMTAXFormView"].push(ZaMTAXFormView.myXFormModifier);