<%@ tag body-content="empty" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.jsp.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlextras" %>

<div class='ZmContactInfoView'>
<c:set var="noDisplayAs"><fmt:message key="noDisplayAs"/></c:set>
<table width=100% cellspacing=0 cellpadding=0>
    <tr class='contactHeaderRow'>
        <td width=20><center><app:img src="contacts/Contact.gif"/></center></td>
        <td><div
                class='contactHeader'>${fn:escapeXml(empty contact.displayFileAs ? noDisplayAs : contact.displayFileAs)}</div>
        </td>
        <td nowrap align='right' class='Tags'>
            <c:if test="${contact.hasTags}">
                <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                <c:forEach items="${tags}" var="tag">
                    <app:img src="${tag.miniImage}"/> <span>${fn:escapeXml(tag.name)} </span>
                </c:forEach>
            </c:if>
        </td>
    </tr>

</table>

<table border="0" cellpadding="2" cellspacing="2" width="100%"><tbody>
    <tr>
        <td class="companyName" width="100%">
            <c:if test="${zm:anySet(contact,'jobTitle company')}">
                ${fn:escapeXml(contact.jobTitle)}
                <c:if test="${!((empty contact.jobTitle) or (empty contact.company))}">,</c:if>
                ${fn:escapeXml(contact.company)}
            </c:if>
        </td><td width="20"><app:img src="contacts/ContactsFolder.gif"/></td><td
            class="companyFolder">${contact.folderName}</td>
    </tr>
</tbody></table>

<table border="0" cellpadding="3" cellspacing="3" width="100%">
<tbody>

<c:if test="${zm:anySet(contact,'email email2 email3')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">
            <app:contactLine line="${contact.email}"/>
            <app:contactLine line="${contact.email2}"/>
            <app:contactLine line="${contact.email3}"/>
        </td>
    </tr>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact,'workStreet workCity workState workPostalCode workCountry workURL workPhone workPhone2 workFax assistantPhone companyPhone callbackPhone')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="work"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385">
            <div class="contactOutput">
                <app:contactLine line="${contact.workStreet}"/>
                <app:contactLine line="${contact.workCity}"/>
                <app:contactLine line="${contact.workState}"/>
                <app:contactLine line="${contact.workPostalCode}"/>
                <app:contactLine line="${contact.workCountry}"/>
                <c:if test="${!empty contact.workURL}">
                    <a target=_new href="<c:url value="${contact.workURL}"/>">${fn:escapeXml(contact.workURL)}</a>
                </c:if>
            </div>
        </td>
        <td valign="top">
            <table width=100% border="0">
                <tbody>
                    <app:contactPhone label="phone" phone="${contact.workPhone}"/>
                    <app:contactPhone label="phone2" phone="${contact.workPhone2}"/>
                    <app:contactPhone label="fax" phone="${contact.workFax}"/>
                    <app:contactPhone label="assistant" phone="${contact.assistantPhone}"/>
                    <app:contactPhone label="company" phone="${contact.companyPhone}"/>
                    <app:contactPhone label="callback" phone="${contact.callbackPhone}"/>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${zm:anySet(contact,'homeStreet homeCity homeState homePostalCode homeCountry homeURL homePhone homePhone2 homeFax mobilePhone pager carPhone')}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="home"/></td>
    </tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385">
            <div class="contactOutput">
                <app:contactLine line="${contact.homeStreet}"/>
                <app:contactLine line="${contact.homeCity}"/>
                <app:contactLine line="${contact.homeState}"/>
                <app:contactLine line="${contact.homePostalCode}"/>
                <app:contactLine line="${contact.homeCountry}"/>
                <c:if test="${!empty contact.homeURL}">
                    <a target=_new href="<c:url value="${contact.homeURL}"/>">${fn:escapeXml(contact.homeURL)}</a>
                </c:if>
            </div>
        </td>
        <td valign="top">
            <table width=100% border="0">
                <tbody>
                    <app:contactPhone label="phone" phone="${contact.homePhone}"/>
                    <app:contactPhone label="phone2" phone="${contact.homePhone2}"/>
                    <app:contactPhone label="fax" phone="${contact.homeFax}"/>
                    <app:contactPhone label="mobile" phone="${contact.mobilePhone}"/>
                    <app:contactPhone label="pager" phone="${contact.pager}"/>
                    <app:contactPhone label="car" phone="${contact.carPhone}"/>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${zm:anySet(contact,'otherStreet otherCity otherState otherPostalCode otherCountry otherURL otherPhone otherFax')}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="other"/></td>
    </tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385">
            <div class="contactOutput">
                <app:contactLine line="${contact.otherStreet}"/>
                <app:contactLine line="${contact.otherCity}"/>
                <app:contactLine line="${contact.otherState}"/>
                <app:contactLine line="${contact.otherPostalCode}"/>
                <app:contactLine line="${contact.otherCountry}"/>
                <c:if test="${!empty contact.otherURL}">
                    <a target=_new href="<c:url value="${contact.otherURL}"/>">${fn:escapeXml(contact.otherURL)}</a>
                </c:if>
            </div>
        </td>
        <td valign="top">
            <table width=100% border="0">
                <tbody>
                    <app:contactPhone label="otherPhone" phone="${contact.otherPhone}"/>
                    <app:contactPhone label="otherFax" phone="${contact.otherFax}"/>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${!empty contact.notes}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="notes"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput">${fn:escapeXml(contact.notes)}<br><br></td>
    </tr>
</c:if>
</tbody>
</table>
</div>
