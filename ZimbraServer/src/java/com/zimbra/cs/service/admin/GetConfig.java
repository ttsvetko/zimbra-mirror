/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Server
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

/*
 * Created on Jun 17, 2004
 */
package com.zimbra.cs.service.admin;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.zimbra.common.service.ServiceException;
import com.zimbra.common.soap.AdminConstants;
import com.zimbra.common.soap.Element;
import com.zimbra.cs.account.Config;
import com.zimbra.cs.account.Provisioning;
import com.zimbra.cs.account.accesscontrol.AdminRight;
import com.zimbra.cs.account.accesscontrol.Rights.Admin;
import com.zimbra.soap.ZimbraSoapContext;

/**
 * @author schemers
 */
public class GetConfig extends AdminDocumentHandler {
    
	public Element handle(Element request, Map<String, Object> context) throws ServiceException {

        ZimbraSoapContext zsc = getZimbraSoapContext(context);
        Provisioning prov = Provisioning.getInstance();

        Element a = request.getElement(AdminConstants.E_A);
        String name = a.getAttribute(AdminConstants.A_N);

        Config config = prov.getConfig();
        
        Set<String> attrsNeeded = new HashSet<String>();
        attrsNeeded.add(name);
        checkRight(zsc, context, config, attrsNeeded);
        
        String value[] = config.getMultiAttr(name);

        Element response = zsc.createElement(AdminConstants.GET_CONFIG_RESPONSE);
        doConfig(response, name, value);

        return response;
	}

	public static void doConfig(Element e, String name, String[] value) {
        if (value == null)
            return;
        for (int i = 0; i < value.length; i++)
            e.addElement(AdminConstants.E_A).addAttribute(AdminConstants.A_N, name).setText(value[i]);
    }

	public static void doConfig(Element e, String name, String value) {
        if (value == null)
            return;
        e.addElement(AdminConstants.E_A).addAttribute(AdminConstants.A_N, name).setText(value);
    }
	
    @Override
    protected void docRights(List<AdminRight> relatedRights, List<String> notes) {
        notes.add("Need get attr right for the specificed attribute.");
    }
}
