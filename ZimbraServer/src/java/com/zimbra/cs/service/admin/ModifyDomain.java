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

import java.util.List;
import java.util.Map;

import com.zimbra.cs.account.AccountServiceException;
import com.zimbra.cs.account.AttributeClass;
import com.zimbra.cs.account.AttributeManager;
import com.zimbra.cs.account.Domain;
import com.zimbra.cs.account.Provisioning;
import com.zimbra.cs.account.Provisioning.DomainBy;
import com.zimbra.cs.account.accesscontrol.AdminRight;
import com.zimbra.cs.account.accesscontrol.Rights.Admin;
import com.zimbra.common.service.ServiceException;
import com.zimbra.common.util.ZimbraLog;
import com.zimbra.common.soap.AdminConstants;
import com.zimbra.common.soap.Element;
import com.zimbra.soap.ZimbraSoapContext;

/**
 * @author schemers
 */
public class ModifyDomain extends AdminDocumentHandler {

    public boolean domainAuthSufficient(Map context) {
        return true;
    }
    
	public Element handle(Element request, Map<String, Object> context) throws ServiceException {

        ZimbraSoapContext zsc = getZimbraSoapContext(context);
	    Provisioning prov = Provisioning.getInstance();

	    String id = request.getAttribute(AdminConstants.E_ID);
	    Map<String, Object> attrs = AdminService.getAttrs(request);
	    
	    Domain domain = prov.get(DomainBy.id, id);
        if (domain == null)
            throw AccountServiceException.NO_SUCH_DOMAIN(id);
        
        if (isDomainAdminOnly(zsc) && !canAccessDomain(zsc, domain)) 
            throw ServiceException.PERM_DENIED("can not access domain"); 
        
        if (domain.isShutdown())
            throw ServiceException.PERM_DENIED("can not access domain, domain is in " + domain.getDomainStatusAsString() + " status");
        
        //
        // Note: pure ACL based AccessManager won't go in the if here, 
        // because its isDomainAdminOnly always returns false.
        //
        if (isDomainAdminOnly(zsc)) {
            for (String attrName : attrs.keySet()) {
                if (attrName.charAt(0) == '+' || attrName.charAt(0) == '-')
                    attrName = attrName.substring(1);

                if (!AttributeManager.getInstance().isDomainAdminModifiable(attrName, AttributeClass.domain))
                    throw ServiceException.PERM_DENIED("can not modify attr: "+attrName);
            }
        }
        
        checkDomainRight(zsc, domain, attrs);
        
        // pass in true to checkImmutable
        prov.modifyAttrs(domain, attrs, true);

        ZimbraLog.security.info(ZimbraLog.encodeAttrs(
                new String[] {"cmd", "ModifyDomain","name", domain.getName()}, attrs));	    

        Element response = zsc.createElement(AdminConstants.MODIFY_DOMAIN_RESPONSE);
	    GetDomain.doDomain(response, domain);
	    return response;
	}
	
    @Override
    protected void docRights(List<AdminRight> relatedRights, StringBuilder notes) {
        notes.append(String.format(sDocRightNotesModifyEntry, Admin.R_modifyDomain.getName(), "domain"));
    }
}