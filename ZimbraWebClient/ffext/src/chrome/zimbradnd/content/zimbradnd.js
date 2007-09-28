/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

var zUploadService = {
  uploadFiles:  function(obj) {
		if (self) try { self.focus(); } catch (e) {}
    obj.click();
  },
  processFiles: function(evt, files) {
		try {
        var form = null;
				var inputName = '_attFile_';
				var inputSize = 50;
				var ownDoc = evt.target.ownerDocument;
				
        var ulEle = ownDoc.getElementById('zdnd_ul');
        ulEle.innerHTML = '';
        
        if (files.length > 0)
				{
          for (var i = 0; i < files.length; i++)
					{
            var li = ulEle.ownerDocument.createElement('LI');
						var input = ulEle.ownerDocument.createElement('INPUT');
						input.type = 'file';
						input.name = inputName;
						input.size = inputSize;
						input.value = files[i];
						li.appendChild(input);
						ulEle.appendChild(li);
					}
				}
				zUploadService.uploadFiles(ownDoc.getElementById('zdnd_button'));
		}
		catch(e) {
		}
	}
}

var zDnDService = {
  canHandleMultipleItems: true,
	onDragStart: function (evt , transferData, action) {
	},
	onDragOver: function (evt,flavour,session) { 		
	},
	onDrop : function (evt, transferData, session) {
	try
	{
    var td = transferData.flavour? transferData: transferData.first.first; 
		if (td.flavour.contentType == "application/x-moz-file")
		{
			var files = [];
			if(transferData.dataList && transferData.dataList.length > 1)
			{
				for(var i = 0; i < transferData.dataList.length; i++)
				{
					var td = transferData.dataList[i];
					for(var j = 0; j < td.dataList.length; j++)
					{
						var fd = td.dataList[j];
						if(fd.flavour.contentType == "application/x-moz-file")
						{
							files.push(fd.data.path);
						}
					}
				}
			}
			else
			{
				files.push(td.data.path);
			}
			zUploadService.processFiles(evt, files);
		}
	}
	catch(e)
	{
	}
	},
	getSupportedFlavours : function () {
		var flavours = new FlavourSet();
		flavours.appendFlavour("application/x-moz-file","nsIFile");
		flavours.appendFlavour("text/unicode");
		return flavours;
	}
};
	
var ZimbraDnD = {
	init: function(e)
	{
    var oZmCv = e.target.parentNode;
    e.target.ownerDocument.getElementById('zdnd_tooltip').style.display = "block";
    if(oZmCv.className == "ZmComposeView") {
      oZmCv.addEventListener("dragdrop", ZimbraDnD.onDrop, false);
    }
    
	},
	onDrop: function(e) 
	{
		try {
			nsDragAndDrop.drop(e, zDnDService);
		} catch(ex) { }
	}
};

document.addEventListener("ZimbraDnD", function(e) { ZimbraDnD.init(e); }, false, true);
