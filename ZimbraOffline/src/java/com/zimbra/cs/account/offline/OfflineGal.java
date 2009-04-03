/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Server
 * Copyright (C) 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
package com.zimbra.cs.account.offline;

import java.io.IOException;

import com.zimbra.common.service.ServiceException;
import com.zimbra.common.soap.AccountConstants;
import com.zimbra.common.soap.Element;
import com.zimbra.common.soap.MailConstants;
import com.zimbra.cs.account.Provisioning;
import com.zimbra.cs.offline.OfflineLog;
import com.zimbra.cs.offline.common.OfflineConstants;
import com.zimbra.cs.index.SortBy;
import com.zimbra.cs.index.ZimbraQueryResults;
import com.zimbra.cs.index.queryparser.ParseException;
import com.zimbra.cs.mailbox.Contact;
import com.zimbra.cs.mailbox.Folder;
import com.zimbra.cs.mailbox.MailItem;
import com.zimbra.cs.mailbox.Mailbox;
import com.zimbra.cs.mailbox.MailboxManager;
import com.zimbra.cs.mailbox.OfflineServiceException;
import com.zimbra.common.util.Pair;

public class OfflineGal {

    public static final String CTYPE_ACCOUNT = "account";
    public static final String CTYPE_RESOURCE = "resource";
    public static final String CTYPE_ALL = "all";
    
    public static final String CRTYPE_LOCATION = "Location";
    public static final String CRTYPE_EQUIPMENT = "Equipment";
    
    public static final String A_zimbraCalResType = "zimbraCalResType";
    public static final String A_zimbraCalResLocationDisplayName = "zimbraCalResLocationDisplayName";
    
    public static final String SECOND_GAL_FOLDER = "Contacts2";
    
    private OfflineAccount mAccount;
    private Mailbox mGalMbox = null;
    private Mailbox.OperationContext mOpContext = null;
    
    public OfflineGal(OfflineAccount account) {
        mAccount = account;
    }

    public OfflineAccount getAccount() {
        return mAccount;
    }
    
    public Mailbox getGalMailbox() {
        return mGalMbox;
    }
        
    public Mailbox.OperationContext getOpContext() {
        return mOpContext;
    }
    
    public ZimbraQueryResults search(String name, int limit) throws ServiceException {
        return search(name, limit, CTYPE_ACCOUNT);
    }
    
    public ZimbraQueryResults search(String name, int limit, String type) throws ServiceException {        
        String galAcctId = mAccount.getAttr(OfflineConstants.A_offlineGalAccountId, false);
        mGalMbox = null;
        
        if (galAcctId != null && galAcctId.length() > 0)
            mGalMbox = MailboxManager.getInstance().getMailboxByAccountId(galAcctId, false);
        if (mGalMbox == null)
            throw OfflineServiceException.MISSING_GAL_MAILBOX(mAccount.getName());
       
        byte[] types = new byte[1];
        types[0] = MailItem.TYPE_CONTACT;
        mOpContext = new Mailbox.OperationContext(mGalMbox);
        
        Folder fstFolder = mGalMbox.getFolderById(mOpContext, Mailbox.ID_FOLDER_CONTACTS);
        Folder sndFolder = mGalMbox.getFolderByPath(mOpContext, SECOND_GAL_FOLDER);
        Folder currFolder = fstFolder.getItemCount() > sndFolder.getItemCount() ? fstFolder : sndFolder;
        
        name = name.trim();
        String[] searchFields = {Contact.A_firstName, Contact.A_lastName, Contact.A_fullName,
            Contact.A_email, Contact.A_email2, Contact.A_email3};
        String query = "in:\"" + currFolder.getName() + "\"";
        if (name.length() > 0 && !name.equals(".")) {
            String qname = ":\"" + name + "*\"";
            query += " AND (";
            for (int i = 0; i < searchFields.length; i++)
                query = query + (i > 0 ? " OR #" : "#") + searchFields[i] + qname;
            if (!type.equals(CTYPE_ACCOUNT))
                query = query + " OR #" + A_zimbraCalResLocationDisplayName + qname;
            query += ")";
        }
        if (type.equals(CTYPE_ACCOUNT))
            query = query + " AND #" + Contact.A_type + ":" + CTYPE_ACCOUNT;
        else if (type.equals(CTYPE_RESOURCE))
            query = query + " AND #" + Contact.A_type + ":" + CTYPE_RESOURCE;
    
        try  {
            return mGalMbox.search(mOpContext, query, types, SortBy.SCORE_DESCENDING, limit);
        } catch (ParseException e) {
            OfflineLog.offline.debug("gal mailbox parse error (" + mAccount.getName() + "): " + e.getMessage());
            return null;
        } catch (IOException e) {
            OfflineLog.offline.debug("gal mailbox IO error (" + mAccount.getName() + "): " + e.getMessage());
            return null;
        }
    }   
    
    public void searchAccounts(Element response, String name) throws ServiceException {
        searchAccounts(response, name, 0);
    }
    
    public void searchAccounts(Element response, String name, int limit) throws ServiceException {
        limit = limit == 0 ? mAccount.getIntAttr(Provisioning.A_zimbraGalMaxResults, 100) : limit;        
        ZimbraQueryResults zqr = search(name, limit + 1); // use limit + 1 so that we know when to set "had more"
        if (zqr == null) {
            response.addAttribute(AccountConstants.A_MORE, false);
            return;
        }
                   
        try {
            int c = 0;
            while (c++ < limit && zqr.hasNext()) {
                int id = zqr.getNext().getItemId();
            
                Contact contact = (Contact) mGalMbox.getItemById(mOpContext, id, MailItem.TYPE_CONTACT);
                Element cn = response.addElement(MailConstants.E_CONTACT);
                cn.addAttribute(MailConstants.A_ID, id);
            
                String val;
                if ((val = contact.get(Contact.A_firstName)) != null)
                    cn.addKeyValuePair(Contact.A_firstName, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
                if ((val = contact.get(Contact.A_lastName)) != null)
                    cn.addKeyValuePair(Contact.A_lastName, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
                if ((val = contact.get(Contact.A_fullName)) != null)
                    cn.addKeyValuePair(Contact.A_fullName, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
                if ((val = contact.get(Contact.A_email)) != null)
                    cn.addKeyValuePair(Contact.A_email, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
                if ((val = contact.get(Contact.A_email2)) != null)
                    cn.addKeyValuePair(Contact.A_email2, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
                if ((val = contact.get(Contact.A_email3)) != null)
                    cn.addKeyValuePair(Contact.A_email3, val, MailConstants.E_ATTRIBUTE, MailConstants.A_ATTRIBUTE_NAME);
            }
                    
            response.addAttribute(AccountConstants.A_MORE, zqr.hasNext());
        } finally {
            zqr.doneWithSearchResults();
        }
    }
    
    // Return: first  - id of current GAL folder, second - id of previous GAL folder
    public static Pair<Integer, Integer> getSyncFolders(Mailbox galMbox, Mailbox.OperationContext context) throws ServiceException {
        Folder fstFolder = galMbox.getFolderById(context, Mailbox.ID_FOLDER_CONTACTS);
        Folder sndFolder = galMbox.getFolderByPath(context, SECOND_GAL_FOLDER);
        int fstId = fstFolder.getId();
        int sndId = sndFolder.getId();
        return fstFolder.getItemCount() > 0 ? new Pair<Integer, Integer>(new Integer(fstId), new Integer(sndId)) :
            new Pair<Integer, Integer>(new Integer(sndId), new Integer(fstId));
    }
}
