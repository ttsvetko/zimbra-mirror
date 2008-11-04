/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
ZmCalItem = function(type, list, id, folderId) {
	if (arguments.length == 0) { return; }

	ZmCalBaseItem.call(this, type, list, id, folderId);

	this.notesTopPart = null; // ZmMimePart containing children w/ message parts
	this.attachments = null;
	this.viewMode = ZmCalItem.MODE_NEW;
	this._recurrence = new ZmRecurrence(this);
	this._noBusyOverlay = null;
};

ZmCalItem.prototype = new ZmCalBaseItem;
ZmCalItem.prototype.constructor = ZmCalItem;

ZmCalItem.prototype.toString =
function() {
	return "ZmCalItem";
};

// Consts

ZmCalItem.MODE_NEW					= 1;
ZmCalItem.MODE_EDIT					= 2;
ZmCalItem.MODE_EDIT_SINGLE_INSTANCE	= 3;
ZmCalItem.MODE_EDIT_SERIES			= 4;
ZmCalItem.MODE_DELETE				= 5;
ZmCalItem.MODE_DELETE_INSTANCE		= 6;
ZmCalItem.MODE_DELETE_SERIES		= 7;
ZmCalItem.MODE_NEW_FROM_QUICKADD 	= 8;
ZmCalItem.MODE_GET					= 9;
ZmCalItem.MODE_LAST					= 9;

ZmCalItem.PRIORITY_LOW				= 9;
ZmCalItem.PRIORITY_NORMAL			= 5;
ZmCalItem.PRIORITY_HIGH				= 1;

ZmCalItem.ROLE_CHAIR				= "CHA";
ZmCalItem.ROLE_REQUIRED				= "REQ";
ZmCalItem.ROLE_OPTIONAL				= "OPT";
ZmCalItem.ROLE_NON_PARTICIPANT		= "NON";

ZmCalItem.SERVER_WEEK_DAYS			= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

ZmCalItem.ATTACHMENT_CHECKBOX_NAME	= "__calAttCbox__";


// Getters

ZmCalItem.prototype.getCompNum			= function() { return this.compNum || "0"; }
ZmCalItem.prototype.getFolder			= function() { };						// override if necessary
ZmCalItem.prototype.getOrganizer 		= function() { return this.organizer || ""; };
ZmCalItem.prototype.getSentBy           = function() { return this.sentBy || ""; };
ZmCalItem.prototype.getOrigStartDate 	= function() { return this._origStartDate || this.startDate; };
ZmCalItem.prototype.getOrigStartTime 	= function() { return this.getOrigStartDate().getTime(); };
ZmCalItem.prototype.getOrigTimezone     = function() { return this._origTimezone || this.timezone; };
ZmCalItem.prototype.getRecurBlurb		= function() { return this._recurrence.getBlurb(); };
ZmCalItem.prototype.getRecurType		= function() { return this._recurrence.repeatType; };
ZmCalItem.prototype.getTimezone         = function() { return this.timezone; };
ZmCalItem.prototype.getSummary			= function(isHtml) { };					// override if necessary
ZmCalItem.prototype.getToolTip			= function(controller) { };				// override if necessary

ZmCalItem.prototype.isCustomRecurrence 	= function() { return this._recurrence.repeatCustom == "1" || this._recurrence.repeatEndType != "N"; };
ZmCalItem.prototype.isOrganizer 		= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
ZmCalItem.prototype.isRecurring 		= function() { return (this.recurring || (this._rawRecurrences != null)); };
ZmCalItem.prototype.hasAttachments 		= function() { return this.getAttachments() != null; };
ZmCalItem.prototype.hasAttendeeForType	= function(type) { return false; }		// override if necessary
ZmCalItem.prototype.hasPersonAttendees	= function() { return false; }			// override if necessary

// Setters
ZmCalItem.prototype.setAllDayEvent 		= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
ZmCalItem.prototype.setName 			= function(newName) 	{ this.name = newName; };
ZmCalItem.prototype.setOrganizer 		= function(organizer) 	{ this.organizer = organizer != "" ? organizer : null; };
ZmCalItem.prototype.setRecurType		= function(repeatType)	{ this._recurrence.repeatType = repeatType; };
ZmCalItem.prototype.setType 			= function(newType) 	{ this.type = newType; };


ZmCalItem.prototype.setFolderId =
function(folderId) {
	this.folderId = folderId || ZmOrganizer.ID_CALENDAR;
};

// Returns the "local" folder Id even for remote folders. Otherwise, just use
// this.folderId if you dont care.
ZmCalItem.prototype.getLocalFolderId =
function() {
	var fid = this.folderId;
	if (this.isShared()) {
		var folder = appCtxt.getById(this.folderId);
		if (folder)
			fid = folder.id;
	}
	return fid;
};

ZmCalItem.prototype.setEndDate =
function(endDate, keepCache) {
	this.endDate = new Date(endDate instanceof Date ? endDate.getTime(): endDate);
	if (!keepCache)
		this._resetCached();
};

ZmCalItem.prototype.setStartDate =
function(startDate, keepCache) {
	if (this._origStartDate == null && this.startDate != null) {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate instanceof Date ? startDate.getTime() : startDate);

	if (!keepCache) {
		this._resetCached();
	}

	// recurrence should reflect start date
	if (this.recurring && this._recurrence) {
		this._recurrence._startDate = this.startDate;
	}
};

ZmCalItem.prototype.setTimezone =
function(timezone, keepCache) {
	if (this._origTimezone == null) {
		this._origTimezone = timezone;
	}
	this.timezone = timezone;
	if (!keepCache) {
		this._resetCached();
	}
};

/**
 * This method sets the view mode, and resets any other fields that should not
 * be set for that view mode.
 */
ZmCalItem.prototype.setViewMode =
function(mode) {
	this.viewMode = mode || ZmCalItem.MODE_NEW;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
		this._recurrence.repeatType = "NON";
};

/**
 * Walks the notesParts array looking for the first part that matches given
 * content type - for now, returns the content (but we could just return the
 * whole part?)
*/
ZmCalItem.prototype.getNotesPart =
function(contentType) {
	if (this.notesTopPart) {
		var ct = contentType || ZmMimeTable.TEXT_PLAIN;
		var content = this.notesTopPart.getContentForType(ct);

		// if requested content type not found, try the other
		if (content == null || content == "") {
			if (ct == ZmMimeTable.TEXT_PLAIN) {
				var div = document.createElement("div");
				content = this.notesTopPart.getContentForType(ZmMimeTable.TEXT_HTML);
				div.innerHTML = content || "";
				var text = AjxStringUtil.convertHtml2Text(div);
				return text.substring(1); // above func prepends \n due to div
			} else if (ct == ZmMimeTable.TEXT_HTML) {
				content = AjxStringUtil.convertToHtml(this.notesTopPart.getContentForType(ZmMimeTable.TEXT_PLAIN));
			}
		}
		return AjxUtil.isString(content) ? content : content.content;
	} else {
		return this.fragment;
	}
};

// returns "owner" of remote/shared calItem folder this calItem belongs to
ZmCalItem.prototype.getRemoteFolderOwner =
function() {
	// bug fix #18855 - dont return the folder owner if moving betw. accounts
	var controller = AjxDispatcher.run("GetCalController");
	if (controller.isMovingBetwAccounts(this, this.folderId)) {
		return null;
	}

	var folder = this.getFolder();
	return (folder && folder.link) ? folder.owner : null;
};

ZmCalItem.prototype.isReadOnly =
function() {
	var isLinkAndReadOnly = false;
	var folder = this.getFolder();
	// if we're dealing w/ a shared cal, find out if we have any write access
	if (folder.link) {
		var shares = folder.getShares();
		var share = shares ? shares[0] : null;
		isLinkAndReadOnly = share && !share.isWrite();
	}

	return (!this.isOrganizer() || isLinkAndReadOnly);
};

ZmCalItem.prototype.resetRepeatWeeklyDays =
function() {
	if (this.startDate) {
		this._recurrence.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()]];
	}
};

ZmCalItem.prototype.resetRepeatMonthlyDayList =
function() {
	if (this.startDate) {
		this._recurrence.repeatMonthlyDayList = [this.startDate.getDate()];
	}
};

ZmCalItem.prototype.resetRepeatYearlyMonthsList =
function(mo) {
	this._recurrence.repeatYearlyMonthsList = mo;
};

ZmCalItem.prototype.resetRepeatCustomDayOfWeek =
function() {
	if (this.startDate) {
		this._recurrence.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()];
	}
};

ZmCalItem.prototype.isOverlapping =
function(other, checkFolder) {
	if (checkFolder && this.folderId != other.folderId) { return false; }

	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();

	return (tst < oet) && (tet > ost);
};

ZmCalItem.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();
	return (tst < endTime && tet > startTime);
};

ZmCalItem.prototype.parseAlarmData =
function() {
	if (!this.alarmData) { return; }

	for (var i in this.alarmData) {
		var alarm = this.alarmData[i].alarm;
		if (alarm) {
			for (var j in alarm) {
				this.parseAlarm(alarm[j]);
			}
		}
	}
};

ZmCalItem.prototype.parseAlarm =
function(tmp) {
	if (!tmp) { return; }

	var m, h, d;
	var trigger = (tmp) ? tmp.trigger : null;
	var rel = (trigger && (trigger.length > 0)) ? trigger[0].rel : null;
	m = (rel && (rel.length > 0)) ? rel[0].m : null;
	d = (rel && (rel.length > 0)) ? rel[0].d : null;
	h = (rel && (rel.length > 0)) ? rel[0].h : null;

	this._reminderMinutes = 0;
	if (tmp && (tmp.action == "DISPLAY")) {
		if (m != null) {
			this._reminderMinutes = m;
		}
		if (h != null) {
			h = parseInt(h);
			this._reminderMinutes = h*60;
		}
		if (d != null) {
			d = parseInt(d);
			this._reminderMinutes = d*24*60;
		}
	}
};

/**
 * return true if the start time of this appt is within range
 */
ZmCalItem.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * return true if the end time of this appt is within range
 */
ZmCalItem.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

ZmCalItem.prototype.setDateRange =
function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
};

ZmCalItem.prototype.getDateRange =
function(instance, current, refPath) {
	return { startDate:this.startDate, endDate: this.endDate };
};

/**
 * accepts a comma delimeted string of ids
 */
ZmCalItem.prototype.setAttachments =
function(ids) {
	this.attachments = [];

	if (ids && ids.length > 0) {
		var split = ids.split(',');
		for (var i = 0 ; i < split.length; i++)
			this.attachments[i] = { id:split[i] };
	}
};

ZmCalItem.prototype.getAttachments =
function() {
	var attachs = this.message ? this.message.attachments : null;
	if (attachs) {
		if (this._validAttachments == null) {
			this._validAttachments = [];
			for (var i = 0; i < attachs.length; ++i) {
				if (this.message.isRealAttachment(attachs[i]))
					this._validAttachments.push(attachs[i]);
			}
		}
		return this._validAttachments.length > 0 ? this._validAttachments : null;
	}
	return null;
};

ZmCalItem.prototype.removeAttachment =
function(part) {
	if (this._validAttachments && this._validAttachments.length > 0) {
		for (var i = 0; i < this._validAttachments.length; i++) {
			if (this._validAttachments[i].part == part) {
				this._validAttachments.splice(i,1);
				break;
			}
		}
	}
};

ZmCalItem.prototype.getShortStartHour =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(this.startDate);
};

ZmCalItem.prototype.getUniqueStartDate =
function() {
	if (this._uniqueStartDate == null && this.uniqStartTime) {
		this._uniqueStartDate = new Date(this.uniqStartTime);
	}
	return this._uniqueStartDate;
};

ZmCalItem.prototype.getUniqueEndDate =
function() {
	if (this._uniqueEndDate == null && this.uniqStartTime) {
		this._uniqueEndDate = new Date(this.uniqStartTime + this.getDuration());
	}
	return this._uniqueEndDate;
};

ZmCalItem.prototype.getDetails =
function(viewMode, callback, errorCallback, ignoreOutOfDate, noBusyOverlay, batchCmd) {
	var mode = viewMode || this.viewMode;

	var seriesMode = mode == ZmCalItem.MODE_EDIT_SERIES;
	if (this.message == null) {
		var id = seriesMode ? (this.seriesInvId || this.invId) : this.invId;
		this.message = new ZmMailMsg(id);
		var respCallback = new AjxCallback(this, this._handleResponseGetDetails, [mode, this.message, callback]);
		var respErrorCallback = (!ignoreOutOfDate)
			? (new AjxCallback(this, this._handleErrorGetDetails, [mode, callback, errorCallback]))
			: errorCallback;
		var params = {
			callback: respCallback,
			errorCallback: respErrorCallback,
			noBusyOverlay: noBusyOverlay,
			ridZ: (seriesMode ? null : this.ridZ),
			batchCmd: batchCmd
		}
		this.message.load(params);
	} else {
		this.setFromMessage(this.message, mode);
		if (callback) {
			callback.run();
		}
	}
};

ZmCalItem.prototype._handleResponseGetDetails =
function(mode, message, callback, result) {
	// msg content should be text, so no need to pass callback to setFromMessage()
	this.setFromMessage(message, mode);
	if (callback) callback.run(result);
};

ZmCalItem.prototype._handleErrorGetDetails =
function(mode, callback, errorCallback, ex) {
	if (ex.code == "mail.INVITE_OUT_OF_DATE") {
		var soapDoc = AjxSoapDoc.create(this._getSoapForMode(ZmCalItem.MODE_GET), "urn:zimbraMail");
		soapDoc.setMethodAttribute("id", this.id);

		var respCallback = new AjxCallback(this, this._handleErrorGetDetails2, [mode, callback, errorCallback]);
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		appCtxt.getAppController().sendRequest(params);
		return true;
	}
	if (errorCallback) {
		return errorCallback.run(ex);
	}
	return false;
};

ZmCalItem.prototype._handleErrorGetDetails2 =
function(mode, callback, errorCallback, result) {
	// Update invId and force a message reload
	var invite = this._getInviteFromError(result);
	this.invId = [this.id, invite.id].join("-");
	this.message = null;
	var ignoreOutOfDate = true;
	this.getDetails(mode, callback, errorCallback, ignoreOutOfDate);
};

ZmCalItem.prototype.setFromMessage =
function(message, viewMode) {
	if (message == this._currentlyLoaded) { return; }

	if (message.invite) {
		this.isOrg = message.invite.isOrganizer();
		this.organizer = message.invite.getOrganizerEmail();
		this.sentBy = message.invite.getSentBy();
		this.name = message.invite.getName();
		this.isException = message.invite.isException();
		this._setTimeFromMessage(message, viewMode);
		this._setExtrasFromMessage(message);
		this._setRecurrence(message);
	}
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
};

// This method gets called when a mail item is dragged onto the minical and we
// need to load the mail item and parse the right parts to show in ZmCalItemEditView
ZmCalItem.prototype.setFromMailMessage =
function(message, subject) {
	this.name = subject;
	this._setNotes(message);
	// set up message so attachments work
	this.message = message;
	this.invId = message.id;
};

ZmCalItem.prototype.setTextNotes =
function(notes) {
	this.notesTopPart = new ZmMimePart();
	this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
	this.notesTopPart.setContent(notes);
};

ZmCalItem.prototype._setTimeFromMessage =
function(message, viewMode) {
	// if instance of recurring appointment, start date is generated from unique
	// start time sent in appointment summaries. Associated message will contain
	// only the original start time.
	var start = message.invite.getServerStartTime();
	var end = message.invite.getServerEndTime();
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
		var usd = this.getUniqueStartDate();
		if (usd) this.setStartDate(usd);

		var ued = this.getUniqueEndDate();
		if (ued) this.setEndDate(ued);
	} else {
		if (start) this.setStartDate(AjxDateUtil.parseServerDateTime(start));
		if (end) this.setEndDate(AjxDateUtil.parseServerDateTime(end));
	}

	// record whether the start/end dates are in UTC
	this.startsInUTC = start ? start.charAt(start.length-1) == "Z" : null;
	this.endsInUTC = end && start ? end.charAt(start.length-1) == "Z" : null;

	// record timezone if given, otherwise, guess
	var serverId = !this.startsInUTC && message.invite.getServerStartTimeTz();
	this.setTimezone(serverId || AjxTimezone.getServerId(AjxTimezone.DEFAULT));

	// adjust start/end times based on UTC/timezone
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
		var timezone = this.getOrigTimezone();
		ZmCalItem.__adjustDateForTimezone(this.startDate, timezone, this.startsInUTC);
		ZmCalItem.__adjustDateForTimezone(this.endDate, timezone, this.endsInUTC);
		this.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
	}

	var tzrule = AjxTimezone.getRule(AjxTimezone.getClientId(this.getTimezone()));
	if (tzrule) {
		if (tzrule.aliasId) {
			tzrule = AjxTimezone.getRule(tzrule.aliasId) || tzrule;
		}
		this.setTimezone(tzrule.serverId);
	}
};

ZmCalItem.prototype._setExtrasFromMessage =
function(message) {
	// override
};

ZmCalItem.prototype._setRecurrence =
function(message) {
	var recurRules = message.invite.getRecurrenceRules();

	if (recurRules)
		this._recurrence.parse(recurRules);

	if (this._recurrence.repeatWeeklyDays == null)
		this.resetRepeatWeeklyDays();

	if (this._recurrence.repeatMonthlyDayList == null)
		this.resetRepeatMonthlyDayList();
};

// We are removing starting 2 \n's for the bug 21823
// XXX - this does not look very efficient :/
ZmCalItem.prototype._getCleanHtml2Text = 
function(dwtIframe) {
	var textContent;
	var idoc = dwtIframe ? dwtIframe.getDocument() : null;
	var body = idoc ? idoc.body : null;
	if (body) {
		var html = body.innerHTML.replace(/\n/ig, "");
		body.innerHTML = html.replace(/<!--.*-->/ig, "");
		var firstChild = body.firstChild;
		var removeN = (firstChild && firstChild.tagName && firstChild.tagName.toLocaleLowerCase() == "p");
		textContent = AjxStringUtil.convertHtml2Text(body);
		if (removeN) {
			textContent = textContent.replace(/\n\n/i, "");
		}
	}
	return textContent;
};

ZmCalItem.prototype._setNotes =
function(message) {
	var text = message.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	var html = message.getBodyPart(ZmMimeTable.TEXT_HTML);

	this.notesTopPart = new ZmMimePart();
	if (html) {
		var notes = AjxUtil.isString(html) ? html : html.content;
		var htmlContent = this._trimNotesSummary(notes.replace(/<title\s*>.*\/title>/ig,""), true);
		var textContent = "";

		// create a temp iframe to create a proper DOM tree
		var params = {parent:appCtxt.getShell(), hidden:true, html:htmlContent};
		var dwtIframe = new DwtIframe(params);
		if (dwtIframe) {
			textContent = this._getCleanHtml2Text(dwtIframe);
			//bug: 23034 this hidden iframe under shell is adding more space which breaks calendar
			//column view
			var iframe = dwtIframe.getIframe();
			if(iframe && iframe.parentNode){
				iframe.parentNode.removeChild(iframe);
			}
			delete dwtIframe;
		}

		// create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(textContent);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
		htmlPart.setContent(htmlContent);

		this.notesTopPart.setContentType(ZmMimeTable.MULTI_ALT);
		this.notesTopPart.children.add(textPart);
		this.notesTopPart.children.add(htmlPart);
	} else {
		var textContent = this._trimNotesSummary((text && text.content) || "");

		this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		this.notesTopPart.setContent(textContent);
	}
};

/**
 * @param attachmentId 		[string]*		ID of the already uploaded attachment
 * @param callback 			[AjxCallback]*	callback triggered once request for appointment save is complete
 * @param errorCallback 	[AjxCallback]*	callback triggered if error during appointment save request
 * @param notifyList 		[Array]*		optional sublist of attendees to be notified (if different from original list of attendees)
*/
ZmCalItem.prototype.save =
function(attachmentId, callback, errorCallback, notifyList) {
	var needsExceptionId = false;
	var soapDoc = AjxSoapDoc.create(this._getSoapForMode(this.viewMode, this.isException), "urn:zimbraMail");

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
		!this.isException)
	{
		this._addInviteAndCompNum(soapDoc);
		needsExceptionId = true;
	}
	else if (this.viewMode == ZmCalItem.MODE_EDIT ||
			 this.viewMode == ZmCalItem.MODE_EDIT_SERIES)
	{
		this._addInviteAndCompNum(soapDoc);
		needsExceptionId = this.isException;
	}

	var accountName = this.getRemoteFolderOwner();
	var invAndMsg = this._setSimpleSoapAttributes(soapDoc, attachmentId, notifyList, accountName);

	var comp = invAndMsg.inv.getElementsByTagName("comp")[0];
	if (needsExceptionId) {
		var exceptId = soapDoc.set("exceptId", null, comp);
		// bug 13529: exception id based on original appt, not new data
		var allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent;
		if (allDay != "1") {
			var sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
			// bug fix #4697 (part 2)
			var timezone = this.getOrigTimezone();
			if (!this.startsInUTC && timezone) {
				exceptId.setAttribute("tz", timezone);
			}
			exceptId.setAttribute("d", sd);
		} else {
			var sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
			exceptId.setAttribute("d", sd);
		}
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._recurrence.setSoap(soapDoc, comp);
	}

	//set alarm data
	this._setAlarmData(soapDoc, comp);

	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

ZmCalItem.prototype._setAlarmData = 
function(soapDoc, comp) {
	if (this._reminderMinutes == 0 || this._reminderMinutes == null) {
		return;
	}

	var alarm = soapDoc.set("alarm", null, comp);
	alarm.setAttribute("action", "DISPLAY");

	var trigger = soapDoc.set("trigger", null, alarm);

	var rel = soapDoc.set("rel", null, trigger);
	rel.setAttribute("m", this._reminderMinutes ? this._reminderMinutes:0);
	//default option is to remind before appt start
	rel.setAttribute("related", "START");
	rel.setAttribute("neg", "1");

	this._addXPropsToAlarm(soapDoc, alarm);
};

ZmCalItem.prototype._addXPropsToAlarm =
function(soapDoc, alarmNode) {
	if (!this.alarmData) { return; }
	var alarmData = (this.alarmData && this.alarmData.length > 0)? this.alarmData[0] : null;
	var alarm = alarmData ? alarmData.alarm : null;
	var alarmInst = (alarm && alarm.length > 0) ? alarm[0] : null;
	this._setAlarmXProps(alarmInst, soapDoc, alarmNode);
};

ZmCalItem.prototype._setAlarmXProps =
function(alarmInst, soapDoc, alarmNode)  {
   var xprops = (alarmInst && alarmInst.xprop) ? alarmInst.xprop : null;
   if (!xprops) { return; }
	// bug 28924: preserve x props
	xprops = (xprops instanceof Array) ? xprops : [xprops];

	for (var i in xprops) {
		var xprop = xprops[i];
		if (xprop && xprop.name) {
			var x = soapDoc.set("xprop", null, alarmNode);
			x.setAttribute("name", xprop.name);
			if (xprop.value != null) {
				x.setAttribute("value", xprop.value);
			}
			this._addXParamToSoap(soapDoc, x, xprop.xparam);
		}
	}
};

ZmCalItem.prototype.setReminderMinutes =
function(minutes) {
	this._reminderMinutes = minutes;
};

/**
 * Deletes/cancels appointment/invite
 *
 * @param mode				[Integer]			what kind of delete op is this?
 * @param msg				[ZmMailMsg]			message to be sent in lieu of delete
 * @param callback			[AjxCallback]*		callback to trigger after delete
 * @param errorCallback		[AjxCallback]*		error callback to trigger
 * @param batchCmd			[ZmBatchCommand]*	set if part of a batch op.
 */
ZmCalItem.prototype.cancel =
function(mode, msg, callback, errorCallback, batchCmd) {
	this.setViewMode(mode);
	if (msg) {
		// REVISIT: We explicitly set the bodyParts of the message b/c
		// ZmComposeView#getMsg only sets topPart on new message that's returned.
		// And ZmCalItem#_setNotes calls ZmMailMsg#getBodyPart.
		var bodyParts = [];
		var childParts = msg._topPart.node.ct == ZmMimeTable.MULTI_ALT
			? msg._topPart.children.getArray()
			: [msg._topPart];
		for (var i = 0; i < childParts.length; i++) {
			bodyParts.push(childParts[i].node);
		}
		msg.setBodyParts(bodyParts);
		this._setNotes(msg);
		this._doCancel(mode, callback, msg, batchCmd);
	} else {
		// To get the attendees for this appointment, we have to get the message.
		var respCallback = new AjxCallback(this, this._doCancel, [mode, callback, null, batchCmd]);
		var cancelErrorCallback = new AjxCallback(this, this._handleCancelError, [mode, callback, errorCallback]);
		if (this._blobInfoMissing && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this.showBlobMissingDlg();		
		} else {
			this.getDetails(null, respCallback, cancelErrorCallback);
		}
	}
};

ZmCalItem.prototype.showBlobMissingDlg =
function() {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.setMessage(ZmMsg.apptBlobMissing, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
};

ZmCalItem.prototype._handleCancelError = 
function(mode, callback, errorCallback, ex) {

	if (ex.code == "mail.NO_SUCH_BLOB") {
 		//bug: 19033, cannot delete instance of appt with missing blob info
 		if (this.isRecurring() && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this._blobInfoMissing = true;
			this.showBlobMissingDlg();
			return true;
 		} else {
	 		this._doCancel(mode, callback, this.message);
 		}
 		return true;
 	}
	
	if (errorCallback) {
		return errorCallback.run(ex);
	}

	return false;
};

ZmCalItem.prototype._doCancel =
function(mode, callback, msg, batchCmd, result) {
	if (mode == ZmCalItem.MODE_DELETE ||
		mode == ZmCalItem.MODE_DELETE_SERIES ||
		mode == ZmCalItem.MODE_DELETE_INSTANCE)
	{
		var soapDoc = AjxSoapDoc.create(this._getSoapForMode(mode), "urn:zimbraMail");
		var accountName = this.getRemoteFolderOwner();
		this._addInviteAndCompNum(soapDoc);

		// Exceptions should be treated as instances (bug 15817)
		if (mode == ZmCalItem.MODE_DELETE_INSTANCE || this.isException) {
			soapDoc.setMethodAttribute("s", this.getOrigStartTime());
			var inst = soapDoc.set("inst");
			var allDay = this.isAllDayEvent();
			var format = allDay ? AjxDateUtil.getServerDate : AjxDateUtil.getServerDateTime;
			inst.setAttribute("d", format(this.getOrigStartDate()));
			if (!allDay && this.timezone) {
				inst.setAttribute("tz", this.timezone);

				var clientId = AjxTimezone.getClientId(this.timezone);
				ZmTimezone.set(soapDoc, clientId, null, true);
			}
		}

		var m = soapDoc.set("m");
		if (this.isOrganizer()) {
			// NOTE: We only use the explicit list of addresses if sending via
			//       a message compose.
			if (msg) {
				for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
					var type = ZmMailMsg.ADDRS[i];

					// if on-behalf-of, dont set the from address
					if (accountName && type == AjxEmailAddress.FROM) { continue; }

					var vector = msg.getAddresses(type);
					var count = vector.size();
					for (var j = 0; j < count; j++) {
						var addr = vector.get(j);
						var e = soapDoc.set("e", null, m);
						e.setAttribute("a", addr.getAddress());
						e.setAttribute("t", AjxEmailAddress.toSoapType[type]);
					}
				}

				// set from address to on-behalf-of if applicable
				if (accountName) {
					var e = soapDoc.set("e", null, m);
					e.setAttribute("a", accountName);
					e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
				}
			}
			else {
				this._addAttendeesToSoap(soapDoc, null, m, null, accountName);
			}
		}
		soapDoc.set("su", ([ZmMsg.cancelled, ": ", this.name].join("")), m);
		this._addNotesToSoap(soapDoc, m, true);

		if (batchCmd) {
			batchCmd.addRequestParams(soapDoc, callback);
		} else {
			this._sendRequest(soapDoc, accountName, callback);
		}
	} else {
		if (callback) callback.run();
	}
};

// Returns canned text for meeting invites.
// - Instances of recurring meetings should send out information that looks very
//   much like a simple appointment.
ZmCalItem.prototype.getTextSummary =
function() {
	return this.getSummary(false);
};

ZmCalItem.prototype.getHtmlSummary =
function() {
	return this.getSummary(true);
};

/**
 * @param attach		generic Object contain meta info about the attachment
 * @param hasCheckbox	whether to insert a checkbox prior to the attachment
*/
ZmCalItem.prototype.getAttachListHtml =
function(attach, hasCheckbox) {
	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText = null;
	if (size != null) {
		if (size < 1024)		sizeText = size + " B";
		else if (size < 1024^2)	sizeText = Math.round((size/1024) * 10) / 10 + " KB";
		else 					sizeText = Math.round((size / (1024*1024)) * 10) / 10 + " MB";
	}

	var html = [];
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	if (hasCheckbox) {
		html[i++] = "<td width=1%><input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "' name='";
		html[i++] = ZmCalItem.ATTACHMENT_CHECKBOX_NAME;
		html[i++] = "'></td>";
	}

	var hrefRoot = "href='" + msgFetchUrl + "&id=" + this.invId + "&amp;part=";
	html[i++] = "<td width=20><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);
	html[i++] = "</a></td>";
	html[i++] = "<td><a target='_blank' class='AttLink' ";
	if (appCtxt.get(ZmSetting.MAIL_ENABLED) && attach.ct == ZmMimeTable.MSG_RFC822) {
		html[i++] = " href='javascript:;' onclick='ZmCalItemView.rfc822Callback(";
		html[i++] = '"';
		html[i++] = this.invId;
		html[i++] = '"';
		html[i++] = ",\"";
		html[i++] = attach.part;
		html[i++] = "\"); return false;'";
	} else {
		html[i++] = hrefRoot + attach.part + "'";
	}
	html[i++] = ">";
	html[i++] = attach.filename;
	html[i++] = "</a>";

	var addHtmlLink = (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) &&
					   attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "&nbsp;(";
		if (sizeText) {
			html[i++] = sizeText;
			if (addHtmlLink)
				html[i++] = ", ";
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&view=html";
			html[i++] = "'>";
			html[i++] = ZmMsg.viewAsHtml;
			html[i++] = "</a>";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = ", ";
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&disp=a'>";
			html[i++] = ZmMsg.download;
			html[i++] = "</a>";
		}
		html[i++] = ")";
	}

	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	return html.join("");
};


// Private / Protected methods

ZmCalItem.prototype._getTextSummaryTime =
function(isEdit, fieldstr, extDate, start, end, hasTime) {
	var showingTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);

	var buf = [];
	var i = 0;

	if (extDate) {
		buf[i++] = AjxDateUtil.longComputeDateStr(extDate);
		buf[i++] = ", ";
	}
	if (this.isAllDayEvent()) {
		buf[i++] = ZmMsg.allDay;
	} else {
		var formatter = AjxDateFormat.getTimeInstance();
		if (start)
			buf[i++] = formatter.format(start);
		if (start && end)
			buf[i++] = " - ";
		if (end)
			buf[i++] = formatter.format(end);

		if (showingTimezone) {
			buf[i++] = " ";
			buf[i++] = AjxTimezone.getLongName(AjxTimezone.getClientId(this.timezone));
		}
	}
	// NOTE: This relies on the fact that setModel creates a clone of the
	//		 appointment object and that the original object is saved in
	//		 the clone as the _orig property.
	if (isEdit && ((this._orig && this._orig.isAllDayEvent() != this.isAllDayEvent()) || hasTime)) {
		buf[i++] = " ";
		buf[i++] = ZmMsg.apptModifiedStamp;
	}
	buf[i++] = "\n";

	return buf.join("");
};

// Uses indexOf() rather than a regex since IE didn't split on the regex correctly.
ZmCalItem.prototype._trimNotesSummary =
function(notes, isHtml) {
	if (notes) {
		var idx = notes.indexOf(ZmItem.NOTES_SEPARATOR);
		if (idx != -1) {
			notes = notes.substr(idx + ZmItem.NOTES_SEPARATOR.length);
			var junk = isHtml ? "</div><br>" : "\n\n";
			if (notes.indexOf(junk) == 0) {
				notes = notes.replace(junk, "");
			}
		}
	}
	return AjxStringUtil.trim(notes);
};

ZmCalItem.prototype._resetCached =
function() {
	delete this._startTimeUniqId; this._startTimeUniqId = null;
	delete this._validAttachments; this._validAttachments = null;
	delete this.tooltip; this.tooltip = null;
};

ZmCalItem.prototype._getTTDay =
function(d) {
	return DwtCalendar.getDayFormatter().format(d);
};

ZmCalItem.prototype._addInviteAndCompNum =
function(soapDoc) {
	if (this.viewMode == ZmCalItem.MODE_EDIT_SERIES || this.viewMode == ZmCalItem.MODE_DELETE_SERIES) {
		if (this.recurring && this.seriesInvId != null) {
			soapDoc.setMethodAttribute("id", this.seriesInvId);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
		}
	} else {
		if (this.invId != null && this.invId != -1) {
			soapDoc.setMethodAttribute("id", this.invId);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
		}
	}
};

ZmCalItem.prototype._getDefaultBlurb =
function(cancel, isHtml) {
	var buf = [];
	var i = 0;
	var singleInstance = this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
						 this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE;

	if (isHtml) buf[i++] = "<h3>";

	if (cancel) {
		buf[i++] = singleInstance ? ZmMsg.apptInstanceCanceled : ZmMsg.apptCanceled;
	} else {
		if (this.viewMode == ZmCalItem.MODE_EDIT ||
			this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
			this.viewMode == ZmCalItem.MODE_EDIT_SERIES)
		{
			buf[i++] = singleInstance ? ZmMsg.apptInstanceModified : ZmMsg.apptModified;
		}
		else
		{
			buf[i++] = ZmMsg.apptNew;
		}
	}

	if (isHtml) buf[i++] = "</h3>";

	buf[i++] = "\n\n";
	buf[i++] = this.getSummary(isHtml);

	return buf.join("");
};

// Server request calls

ZmCalItem.prototype._getSoapForMode =
function(mode, isException) {
	// override
};

ZmCalItem.prototype._getInviteFromError =
function(result) {
	// override
};

ZmCalItem.prototype._setSimpleSoapAttributes =
function(soapDoc, attachmentId, notifyList, onBehalfOf) {

	var m = this._messageNode = soapDoc.set('m');

	if (onBehalfOf) {
		m.setAttribute("l", this.getFolder().rid);
	} else {
		m.setAttribute("l", this.folderId);
	}

	var inv = soapDoc.set("inv", null, m);
	if (this.uid != null && this.uid != -1)
		inv.setAttribute("uid", this.uid);

	var comp = soapDoc.set("comp", null, inv);

	// attendees
	//if (this.isOrganizer()) {
		this._addAttendeesToSoap(soapDoc, comp, m, notifyList, onBehalfOf);
	//}

	this._addExtrasToSoap(soapDoc, inv, comp);

	// date/time
	this._addDateTimeToSoap(soapDoc, inv, comp);

	// xprops
	this._addXPropsToSoap(soapDoc, inv, comp);
	
	// subject/location
	soapDoc.set("su", this.name, m);
	comp.setAttribute("name", this.name);
	this._addLocationToSoap(comp);

	// notes
	this._addNotesToSoap(soapDoc, m);

	// set organizer
	var user = appCtxt.get(ZmSetting.USERNAME);
	var organizer = this.organizer || user;
	var org = soapDoc.set("or", null, comp);
	org.setAttribute("a", organizer);
	var calendar  = this.getFolder();
	if (calendar.isRemote()) {
		org.setAttribute("sentBy", user); // if on-behalf of, set sentBy
	}
	var orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
	var orgName = orgEmail.getName();
	if (orgName) org.setAttribute("d", orgName);

	// handle attachments
	this.flagLocal(ZmItem.FLAG_ATTACH, false);
	this.getAttachments(); // bug 22874: make sure to populate _validAttachments
	if (attachmentId != null ||
		(this._validAttachments != null && this._validAttachments.length))
	{
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId){
			attachNode.setAttribute("aid", attachmentId);
			this.flagLocal(ZmItem.FLAG_ATTACH, true);
		}

		if (this._validAttachments) {
			var validAttLen = this._validAttachments.length;
			for (var i = 0; i < validAttLen; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				var mid = (this.invId || this.message.id);
				if ((mid.indexOf(":") < 0) && calendar.isRemote()) {
					mid = (appCtxt.getActiveAccount().id + ":" + mid);
				}
				msgPartNode.setAttribute("mid", mid);
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
			if (validAttLen > 0) {
				this.flagLocal(ZmItem.FLAG_ATTACH, true);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

ZmCalItem.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	if (this.priority) {
		comp.setAttribute("priority", this.priority);
	}
	comp.setAttribute("status", this.status);
};

ZmCalItem.prototype._addXPropsToSoap =
function(soapDoc, inv, comp) {
	var message = this.message ? this.message : null;
	var invite = (message && message.invite) ? message.invite : null;
	var xprops = invite ? invite.getXProp() : null;
	if (!xprops) { return; }

	// bug 16024: preserve x props
	xprops = (xprops instanceof Array) ? xprops : [xprops];

	for (var i in xprops) {
		var xprop = xprops[i];
		if (xprop && xprop.name) {
			var x = soapDoc.set("xprop", null, comp);
			x.setAttribute("name", xprop.name);
			if (xprop.value != null) {
				x.setAttribute("value", xprop.value);
			}
			this._addXParamToSoap(soapDoc, x, xprop.xparam);
		}		
	}
};

ZmCalItem.prototype._addXParamToSoap = 
function(soapDoc, xprop, xparams) {
	if (!xparams) { return; }

	xparams = (xparams instanceof Array) ? xparams : [xparams]

	for (var j in xparams) {
		var xparam = xparams[j];
		if (xparam && xparam.name) {
			var x = soapDoc.set("xparam", null, xprop);
			x.setAttribute("name", xparam.name);
			if (xparam.value != null) {
				x.setAttribute("value", xparam.value);
			}
		}
	}
};

ZmCalItem.prototype._addDateTimeToSoap =
function(soapDoc, inv, comp) {
	// always(?) set all day
	comp.setAttribute("allDay", this.allDayEvent);

	// timezone
	var tz;
	if (this.timezone) {
		var clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(soapDoc, clientId, inv, true);
		tz = this.timezone;
	}

	// start date
	if (this.startDate) {
		var s = soapDoc.set("s", null, comp);
		if (!this.isAllDayEvent()) {
			var sd = AjxDateUtil.getServerDateTime(this.startDate, this.startsInUTC);

			// set timezone if not utc date/time
			if (!this.startsInUTC && tz && tz.length)
				s.setAttribute("tz", tz);

			s.setAttribute("d", sd);
		} else {
			s.setAttribute("d", AjxDateUtil.getServerDate(this.startDate));
		}
	}

	// end date
	if (this.endDate) {
		var e = soapDoc.set("e", null, comp);
		if (!this.isAllDayEvent()) {
			var ed = AjxDateUtil.getServerDateTime(this.endDate, this.endsInUTC);

			// set timezone if not utc date/time
			if (!this.endsInUTC && tz && tz.length)
				e.setAttribute("tz", tz);

			e.setAttribute("d", ed);

		} else {
			e.setAttribute("d", AjxDateUtil.getServerDate(this.endDate));
		}
	}
};

ZmCalItem.prototype._addAttendeesToSoap =
function(soapDoc, inv, m, notifyList, onBehalfOf) {
	// if this appt is on-behalf-of, set the from address to that person
	if (this.isOrganizer() && onBehalfOf) {
		e = soapDoc.set("e", null, m);
		e.setAttribute("a", onBehalfOf);
		e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
	}
};

ZmCalItem.prototype._addNotesToSoap =
function(soapDoc, m, cancel) {

	var hasAttendees = this.hasAttendeeForType(ZmCalBaseItem.PERSON);
	var tprefix = hasAttendees ? this._getDefaultBlurb(cancel) : "";
	var hprefix = hasAttendees ? this._getDefaultBlurb(cancel, true) : "";

	var mp = soapDoc.set("mp", null, m);
	mp.setAttribute("ct", ZmMimeTable.MULTI_ALT);
	var numSubParts = this.notesTopPart ? this.notesTopPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this.notesTopPart.children.get(i);
			var partNode = soapDoc.set("mp", null, mp);
			var pct = part.getContentType();
			partNode.setAttribute("ct", pct);

			var pprefix = pct == ZmMimeTable.TEXT_HTML ? hprefix : tprefix;
			var content = AjxBuffer.concat(pprefix, part.getContent());
			soapDoc.set("content", content, partNode);
		}
	} else {
		var tcontent = this.notesTopPart ? this.notesTopPart.getContent() : "";
		var textPart = soapDoc.set("mp", null, mp);
		textPart.setAttribute("ct", ZmMimeTable.TEXT_PLAIN);
		soapDoc.set("content", AjxBuffer.concat(tprefix, tcontent), textPart);

		// bug fix #9592 - html encode the text before setting it as the "HTML" part
		var hcontent = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(tcontent));
		var htmlPart = soapDoc.set("mp", null, mp);
		htmlPart.setAttribute("ct", ZmMimeTable.TEXT_HTML);
		var html = "<html><body>" + AjxBuffer.concat(hprefix, hcontent) + "</body></html>";
		soapDoc.set("content", html, htmlPart);
	}
};

ZmCalItem.prototype._sendRequest =
function(soapDoc, accountName, callback, errorCallback) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
};

ZmCalItem.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalBaseItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.isOrg 			= this._getAttr(calItemNode, instNode, "isOrg");
	var org				= calItemNode.or;
	this.organizer		= org && org.a;
	this.sentBy			= org && org.sentBy;
	this.invId 			= this._getAttr(calItemNode, instNode, "invId");
	this.compNum 		= this._getAttr(calItemNode, instNode, "compNum") || "0";
	this.parseAlarmData(this.alarmData);
	this.seriesInvId	= this.recurring ? calItemNode.invId : null;
	this.ridZ 			= instNode && instNode.ridZ;

	if (calItemNode.t) {
		this._parseTags(calItemNode.t);
	}
	if (calItemNode.f) {
		this._parseFlags(calItemNode.f);
	}
};

// Callbacks

ZmCalItem.prototype._handleResponseSend =
function(respName, callback, result) {
	var resp = result.getResponse();

	// branch for different responses
	var response = resp[respName];
	if (response.uid != null) {
		this.uid = response.uid;
	}

	if (response.m != null) {
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId)
			this.message = null;
	}

	this._messageNode = null;

	if (callback) {
		callback.run();
	}
};


// Static methods

ZmCalItem.getLabelForPriority =
function(priority) {
	switch (priority) {
		case ZmCalItem.PRIORITY_LOW:	return ZmMsg.low;
		case ZmCalItem.PRIORITY_NORMAL: return ZmMsg.normal;
		case ZmCalItem.PRIORITY_HIGH:	return ZmMsg.high;
		default: return "";
	}
};

ZmCalItem.getImageForPriority =
function(task, id) {
	switch (task.priority) {
		case ZmCalItem.PRIORITY_LOW:
			return id
				? AjxImg.getImageHtml("TaskLow", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("TaskLow");
		case ZmCalItem.PRIORITY_HIGH:
			return id
				? AjxImg.getImageHtml("TaskHigh", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("TaskHigh");
		default: return "";
	}
};

ZmCalItem.getLabelForStatus =
function(status) {
	switch (status) {
		case ZmCalendarApp.STATUS_CANC: return ZmMsg.cancelled;
		case ZmCalendarApp.STATUS_COMP: return ZmMsg.completed;
		case ZmCalendarApp.STATUS_DEFR: return ZmMsg.deferred;
		case ZmCalendarApp.STATUS_INPR: return ZmMsg.inProgress;
		case ZmCalendarApp.STATUS_NEED: return ZmMsg.notStarted;
		case ZmCalendarApp.STATUS_WAIT: return ZmMsg.waitingOn;
	}
	return "";
};

ZmCalItem.getLabelForParticipationStatus =
function(status) {
	switch (status) {
		case ZmCalBaseItem.PSTATUS_ACCEPT:		return ZmMsg.ptstAccept;
		case ZmCalBaseItem.PSTATUS_DECLINED:	return ZmMsg.ptstDeclined;
		case ZmCalBaseItem.PSTATUS_DEFERRED:	return ZmMsg.ptstDeferred;
		case ZmCalBaseItem.PSTATUS_DELEGATED:	return ZmMsg.ptstDelegated;
		case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:return ZmMsg.ptstNeedsAction;
		case ZmCalBaseItem.PSTATUS_COMPLETED:	return ZmMsg.completed;
		case ZmCalBaseItem.PSTATUS_TENTATIVE:	return ZmMsg.ptstTentative;
		case ZmCalBaseItem.PSTATUS_WAITING:		return ZmMsg.ptstWaiting;
	}
	return "";
};

ZmCalItem.getParticipationStatusIcon =
function(status) {
	switch (status) {
		case ZmCalBaseItem.PSTATUS_ACCEPT:		return "Check";
		case ZmCalBaseItem.PSTATUS_DECLINED:	return "Cancel";
		case ZmCalBaseItem.PSTATUS_DEFERRED:	return "QuestionMark";
		case ZmCalBaseItem.PSTATUS_DELEGATED:	return "Plus";
		case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:return "QuestionMark";
		case ZmCalBaseItem.PSTATUS_COMPLETED:	return "Completed";
		case ZmCalBaseItem.PSTATUS_TENTATIVE:	return "QuestionMark";
		case ZmCalBaseItem.PSTATUS_WAITING:		return "Minus";
	}
	return "";
};

ZmCalItem._getTTDay =
function(d, format) {
	format = format || AjxDateFormat.SHORT;
	var formatter = AjxDateFormat.getDateInstance();
	return formatter.format(d);
};

// REVISIT: Move to AjxDateUtil function
ZmCalItem.__adjustDateForTimezone =
function(date, timezoneServerId, inUTC) {
	var currentOffset = AjxTimezone.getOffset(AjxTimezone.DEFAULT, date);
	var timezoneOffset = currentOffset;
	if (!inUTC) {
		var timezoneClientId = AjxTimezone.getClientId(timezoneServerId);
		timezoneOffset = AjxTimezone.getOffset(timezoneClientId, date);
	}
	var offset = currentOffset - timezoneOffset;
	date.setMinutes(date.getMinutes() + offset);
};
