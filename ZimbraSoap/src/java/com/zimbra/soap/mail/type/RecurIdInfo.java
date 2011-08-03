/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Server
 * Copyright (C) 2011 Zimbra, Inc.
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

package com.zimbra.soap.mail.type;

import com.google.common.base.Objects;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

import com.zimbra.common.soap.MailConstants;
import com.zimbra.soap.base.RecurIdInfoInterface;

@XmlAccessorType(XmlAccessType.NONE)
public class RecurIdInfo implements RecurIdInfoInterface {

    @XmlAttribute(name=MailConstants.A_CAL_RECURRENCE_RANGE_TYPE, required=true)
    private int recurrenceRangeType;

    @XmlAttribute(name=MailConstants.A_CAL_RECURRENCE_ID, required=true)
    private String recurrenceId;

    @XmlAttribute(name=MailConstants.A_CAL_TIMEZONE, required=false)
    private String timezone;

    @XmlAttribute(name=MailConstants.A_CAL_RECURRENCE_ID_Z, required=false)
    private String recurIdZ;

    public RecurIdInfo() {
        this(-1, (String) null);
    }

    public RecurIdInfo(int recurrenceRangeType, String recurrenceId) {
        this.setRecurrenceRangeType(recurrenceRangeType);
        this.setRecurrenceId(recurrenceId);
    }

    @Override
    public RecurIdInfoInterface createFromRangeTypeAndId(
            int recurrenceRangeType, String recurrenceId) {
        return new RecurIdInfo(recurrenceRangeType, recurrenceId);
    }

    @Override
    public void setRecurrenceRangeType(int recurrenceRangeType) {
        this.recurrenceRangeType = recurrenceRangeType;
    }

    @Override
    public void setRecurrenceId(String recurrenceId) {
        this.recurrenceId = recurrenceId;
    }

    @Override
    public void setTimezone(String timezone) { this.timezone = timezone; }
    @Override
    public void setRecurIdZ(String recurIdZ) { this.recurIdZ = recurIdZ; }

    @Override
    public int getRecurrenceRangeType() { return recurrenceRangeType; }
    @Override
    public String getRecurrenceId() { return recurrenceId; }
    @Override
    public String getTimezone() { return timezone; }
    @Override
    public String getRecurIdZ() { return recurIdZ; }

    public Objects.ToStringHelper addToStringInfo(
                Objects.ToStringHelper helper) {
        return helper
            .add("recurrenceRangeType", getRecurrenceRangeType())
            .add("recurrenceId", getRecurrenceId())
            .add("timezone", timezone)
            .add("recurIdZ", recurIdZ);
    }

    @Override
    public String toString() {
        return addToStringInfo(Objects.toStringHelper(this))
                .toString();
    }
}
