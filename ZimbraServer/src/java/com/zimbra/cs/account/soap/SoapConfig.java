/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Server
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

package com.zimbra.cs.account.soap;

import java.util.Map;

import com.zimbra.common.service.ServiceException;
import com.zimbra.common.soap.AdminConstants;
import com.zimbra.cs.account.Config;
import com.zimbra.cs.account.Provisioning;
import com.zimbra.common.soap.Element;
import com.zimbra.common.soap.Element.XMLElement;
import com.zimbra.soap.admin.message.GetAllConfigResponse;
import com.zimbra.soap.admin.message.GetConfigResponse;
import com.zimbra.soap.admin.type.Attr;

class SoapConfig extends Config implements SoapEntry {
    
    SoapConfig(Map<String, Object> attrs, Provisioning provisioning) {
        super(attrs, provisioning);
    }

    SoapConfig(GetAllConfigResponse resp, Provisioning provisioning)
    throws ServiceException {
        super(Attr.collectionToMap(resp.getAttrs()), provisioning);
    }
    
    SoapConfig(GetConfigResponse resp, Provisioning provisioning)
    throws ServiceException {
        super(Attr.collectionToMap(resp.getAttrs()), provisioning);
    }

    SoapConfig(Element e, Provisioning provisioning) throws ServiceException {
        super(SoapProvisioning.getAttrs(e), provisioning);
    }

    public void modifyAttrs(SoapProvisioning prov, Map<String, ? extends Object> attrs, boolean checkImmutable) throws ServiceException {
        XMLElement req = new XMLElement(AdminConstants.MODIFY_CONFIG_REQUEST);
        SoapProvisioning.addAttrElements(req, attrs);
        setAttrs(SoapProvisioning.getAttrs(prov.invoke(req)));
    }

    public void reload(SoapProvisioning prov) throws ServiceException {
        XMLElement req = new XMLElement(AdminConstants.GET_ALL_CONFIG_REQUEST);
        setAttrs(SoapProvisioning.getAttrs(prov.invoke(req)));
    }
}
