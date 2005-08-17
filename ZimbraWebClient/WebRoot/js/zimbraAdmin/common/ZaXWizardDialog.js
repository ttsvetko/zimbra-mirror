/**
* Creates a new wizard dialog.
* @constructor
* @class
* @param parent - parent control (shell)
* @param className - CSS class name
* @param title - dialog title
* @param w - content area width
* @param h - content area height
* This class represents a reusable wizard dialog. 
* After calling the constructor, define metadata for and call initForm to draw the contents of the dialog
*/
function ZaXWizardDialog (parent, className, title, w, h) {
	if (arguments.length == 0) return;
	var clsName = className || "DwtDialog";
	
	this._pageIx = 1;
	this._currentPage = 1;
	this._localXForm = null;
	this._localXModel = null;
	this._drawn = false;
	this._containedObject = null;
	
	var nextButton = new DwtDialog_ButtonDescriptor(ZaXWizardDialog.NEXT_BUTTON, DwtMsg._next, DwtDialog.ALIGN_RIGHT, new AjxCallback(this, this.goNext));
	var prevButton = new DwtDialog_ButtonDescriptor(ZaXWizardDialog.PREV_BUTTON, DwtMsg._prev, DwtDialog.ALIGN_RIGHT, new AjxCallback(this, this.goPrev));
	var finishButton = new DwtDialog_ButtonDescriptor(ZaXWizardDialog.FINISH_BUTTON, DwtMsg._finish, DwtDialog.ALIGN_RIGHT, new AjxCallback(this, this.finishWizard));
	DwtDialog.call(this, parent, clsName, null, [DwtDialog.CANCEL_BUTTON], [prevButton,nextButton,finishButton]);

	if (!w) {
		this._contentW = "80ex";
	} else {
		this._contentW = w;
	}
	
	if(!h) {
		this._contentH = "100ex";
	} else {
		this._contentH = h;
	}
	

	this._progressDiv = this.getDocument().createElement("div");
	this._progressDiv.style.position = DwtControl.STATIC_STYLE;
	
	this._pageDiv = this.getDocument().createElement("div");
	this._pageDiv.className = "ZaXWizardDialogPageDiv";
	this._pageDiv.style.width = this._contentW;
	this._pageDiv.style.height = this._contentH;
	this._pageDiv.style.overflow = "auto";
	
//	this._progressBar = new ZaXWizProgressBar(this);
	this._createContentHtml();	

//	this._initForm();

	this.setTitle(title);
}

ZaXWizardDialog.prototype = new DwtDialog;
ZaXWizardDialog.prototype.constructor = ZaXWizardDialog;

//Z-index contants for the tabbed view contents are based on Dwt z-index constants
ZaXWizardDialog.Z_ACTIVE_PAGE = Dwt.Z_VIEW+10;
ZaXWizardDialog.Z_HIDDEN_PAGE = Dwt.Z_HIDDEN;
ZaXWizardDialog.Z_TAB_PANEL = Dwt.Z_VIEW+20;
ZaXWizardDialog.Z_CURTAIN = Dwt.Z_CURTAIN;

ZaXWizardDialog.NEXT_BUTTON = 12;
ZaXWizardDialog.PREV_BUTTON = 11;
ZaXWizardDialog.FINISH_BUTTON = 13;

//public methods
ZaXWizardDialog.prototype.toString = 
function () {
	return "ZaXWizardDialog";
}

ZaXWizardDialog.prototype.popdown = 
function () {
	DwtDialog.prototype.popdown.call(this);
}
/*
ZaXWizardDialog.prototype.handleKeys = 
function(ev) {
	var ad = DwtBaseDialog.getActiveDialog();
	var dialogEl = ad.getHtmlElement();
	var target = DwtUiEvent.getTarget(ev);
	var keyCode = DwtKeyEvent.getCharCode(ev);
	switch (keyCode) {
	case DwtKeyEvent.KEY_TAB:
		if (ad && ad._mode == DwtBaseDialog.MODAL) {
			ad.notifyListeners(DwtEvent.TAB, ev);
			DwtUiEvent.setBehaviour(ev, true, true);
		}
		break;
	case DwtKeyEvent.KEY_ENTER:
		ad.notifyListeners(DwtEvent.ENTER, ev);
		break;
	}	
};*/


/**
* Makes the dialog visible, and places it. Everything under the dialog will become veiled
* if we are modal.
*
* @param loc	the desired location
*/
/*
ZaXWizardDialog.prototype.popup =
function(loc) {

	var thisZ = this._zIndex;
	if (this._mode == DwtDialog.MODAL) {
		// place veil under this dialog
		var dialogZ = this._shell._veilOverlay.dialogZ;
		var currentDialogZ = null;
		var veilZ;
		if (dialogZ.length)
			currentDialogZ = dialogZ[dialogZ.length - 1];
		if (currentDialogZ) {
			thisZ = currentDialogZ + 2;
			veilZ = currentDialogZ + 1;
		} else {
			thisZ = this._zIndex;
			veilZ = Dwt.Z_VEIL;
		}
		this._shell._veilOverlay.veilZ.push(veilZ);
		this._shell._veilOverlay.dialogZ.push(thisZ);
		Dwt.setZIndex(this._shell._veilOverlay, veilZ);
	}
	Dwt._ffOverflowHack(this._htmlElId, thisZ, false);
	loc = this._loc = loc || this._loc; // use whichever has a value, local has precedence
	var sizeShell = this._shell.getSize();
	var sizeThis = this.getSize();
	var x, y;
	if (loc == null) {
		// if no location, go for the middle
		x = Math.round((sizeShell.x - sizeThis.x) / 2);
		y = Math.round((sizeShell.y - sizeThis.y) / 2);
	} else {
		x = loc.x;
		y = loc.y;
	}
	// try to stay within shell boundaries
	if ((x + sizeThis.x) > sizeShell.x)
		x = sizeShell.x - sizeThis.x;
	if ((y + sizeThis.y) > sizeShell.y)
		y = sizeShell.y - sizeThis.y;
	this.setLocation(x, y);
	
	this.setZIndex(thisZ);
}*/

/*
* @param pageKey - key to the page to be shown. 
* pageKey is the value returned from @link ZaXWizardDialog.prototype.addPage method
* This method is called by 
*	@link DwtWizardPage.prototype.switchToNextPage 
*	and 
*	@link DwtWizardPage.prototype.switchToPrevPage
*/
ZaXWizardDialog.prototype.goPage = 
function(pageKey) {
	this._containedObject[ZaModel.currentStep] = pageKey;
	this._localXForm.refresh(); //run update script
}

ZaXWizardDialog.prototype.goNext = 
function() {
	this.goPage(this._containedObject[ZaModel.currentStep]+1);
}

ZaXWizardDialog.prototype.goPrev = 
function() {
	this.goPage(this._containedObject[ZaModel.currentStep]-1);
}

ZaXWizardDialog.prototype.finishWizard = 
function() {
	this.popdown();	
}

ZaXWizardDialog.prototype.getCurrentStep = 
function() {
	return this._containedObject[ZaModel.currentStep];	
}

/**
* public method addPage
* @param wizPage - instance of DwtPropertyPage 
* @return - the key for the added page. This key can be used to retreive the tab using @link getPage.
**/
ZaXWizardDialog.prototype.addPage =
function (stepTitle) {
	var pageKey = this._pageIx++;	
	//add a step to the progress bar
//	this._progressBar.addStep(pageKey, stepTitle);
	//add the page 
	return pageKey;
}

/**
* public method _initForm
* @param xModelMetaData
* @param xFormMetaData
**/
ZaXWizardDialog.prototype.initForm = 
function (xModelMetaData, xFormMetaData) {
	if(xModelMetaData == null || xFormMetaData == null)
		throw new AjxException("Metadata for XForm and/or XModel are not defined", AjxException.INVALID_PARAM, "ZaXWizardDialog.prototype._initForm");
		
	this._localXModel = new XModel(xModelMetaData);
	this._localXForm = new XForm(xFormMetaData, this._localXModel, null, this);

	this._localXForm.draw(this._pageDiv);
	this._drawn = true;
}


/**
* @method getObject returns the object contained in the view
* before returning the object this updates the object attributes with 
* tha values from the form fields 
**/
ZaXWizardDialog.prototype.getObject =
function() {
	return this._containedObject;
}

/**
* @method setObject sets the object contained in the view
* @param entry - ZaDomain object to display
**/
ZaXWizardDialog.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	
	this._localXForm.setInstance(this._containedObject.attrs);
}

//private and protected methods

/**
* method _createHtml 
**/

ZaXWizardDialog.prototype._createContentHtml =
function () {

	this._table = this.getDocument().createElement("table");
	this._table.border = 0;
	this._table.width=this._contentW;
	this._table.cellPadding = 0;
	this._table.cellSpacing = 0;
	Dwt.associateElementWithObject(this._table, this);
	this._table.backgroundColor = DwtCssStyle.getProperty(this.parent.getHtmlElement(), "background-color");
	
	/*var row1; //_progressBar
	var col1;
	row1 = this._table.insertRow(0);
	row1.align = "left";
	row1.vAlign = "middle";
	
	col1 = row1.insertCell(row1.cells.length);
	col1.align = "left";
	col1.vAlign = "middle";
	col1.noWrap = true;	
	col1.width="100%";
	col1.className="DwtTabTable";
	col1.appendChild(this._progressBar.getHtmlElement());

	var rowSep;//separator
	var colSep;
	rowSep = this._table.insertRow(1);
	rowSep.align = "center";
	rowSep.vAlign = "middle";
	
	colSep = rowSep.insertCell(rowSep.cells.length);
	colSep.align = "left";
	colSep.vAlign = "middle";
	colSep.noWrap = true;	
	colSep.style.width = this._contentW;
	var sepDiv = this.getDocument().createElement("div");
	sepDiv.className = "horizSep";
	sepDiv.style.width = this._contentW;
	sepDiv.style.height = "5px";
	colSep.appendChild(sepDiv);
	*/
	var row2; //page
	var col2;
	row2 = this._table.insertRow(0);
	row2.align = "left";
	row2.vAlign = "middle";
	
	col2 = row2.insertCell(row2.cells.length);
	col2.align = "left";
	col2.vAlign = "middle";
	col2.noWrap = true;	
	col2.width = this._contentW;
	col2.appendChild(this._pageDiv);

	this._contentDiv.appendChild(this._table);
}

/**
* Override _addChild method. We need internal control over layout of the children in this class.
* Child elements are added to this control in the _createHTML method.
* @param child
**/
ZaXWizardDialog.prototype._addChild =
function(child) {
	this._children.add(child);
}


/**
* @class ZaXWizProgressBar
* @constructor
* @param parent
**/
function ZaXWizProgressBar(parent) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZaXWizProgressBar", DwtControl.STATIC_STYLE);
	this._table = this.getDocument().createElement("table");
	this._table.border = 0;
	this._table.cellPadding = 0;
	this._table.cellSpacing = 0;
	this._menuListeners = new AjxVector();
	this.getHtmlElement().appendChild(this._table);
	this._table.backgroundColor = DwtCssStyle.getProperty(this.parent.getHtmlElement(), "background-color");
	this._stepsNumber = 0; //number of steps
	this._steps = new Array();
	this._lblHeader = new ZaXWizStepZabel(this);
	this._lblHeader.setText("Step 0 of 0");
	this._lblHeader.setActive(true);
}


ZaXWizProgressBar.prototype = new DwtComposite;
ZaXWizProgressBar.prototype.constructor = ZaXWizProgressBar;

ZaXWizProgressBar.prototype.toString = 
function() {
	return "ZaXWizProgressBar";
}

/**
* @param stepKey
**/
ZaXWizProgressBar.prototype.showStep = 
function(stepKey) {
	var szZabelTxt = "Step " + stepKey + " of " + this._stepsNumber;
	if(this._steps[stepKey]) {
		szZabelTxt = szZabelTxt + ": " + this._steps[stepKey];
	}
	this._lblHeader.setText(szZabelTxt);
}

/**
* @param stepKey
* @param stepNumber
**/
ZaXWizProgressBar.prototype.addStep =
function (stepKey, stepTitle) {
	this._steps[stepKey] = stepTitle;
	return (++this._stepsNumber);
}

ZaXWizProgressBar.prototype._addChild =
function(child) {
	this._children.add(child);
	var row;
	var col;
	this._table.width = "100%";
	row = (this._table.rows.length != 0) ? this._table.rows[0]: this._table.insertRow(0);
	row.align = "center";
	row.vAlign = "middle";
		
	col = row.insertCell(row.cells.length);
	col.align = "center";
	col.vAlign = "middle";
	col.noWrap = true;
	col.appendChild(child.getHtmlElement());
}


/**
* @class ZaXWizStepZabel
* @constructor
* @param parent
**/
function ZaXWizStepZabel (parent) {
	DwtZabel.call(this, parent, DwtZabel.ALIGN_CENTER, "ZaXWizStepZabel");
}

ZaXWizStepZabel.prototype = new DwtZabel;
ZaXWizStepZabel.prototype.constructor = ZaXWizStepZabel;

ZaXWizStepZabel.prototype.toString = 
function() {
	return "ZaXWizStepZabel";
}

ZaXWizStepZabel.prototype.setActive = 
function(isActive) {
	if (isActive) {
 		this._textCell.className="ZaXWizStepZabelActive";
 	} else {
	 	this._textCell.className="ZaXWizStepZabelInactive";
 	}
}

