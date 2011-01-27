package com.zimbra.qa.selenium.projects.ajax.ui.briefcase;

import com.zimbra.qa.selenium.framework.ui.AbsApplication;
import com.zimbra.qa.selenium.framework.ui.AbsDisplay;
import com.zimbra.qa.selenium.framework.util.HarnessException;

/**
 * The <code>PreviewDocument<code> object defines a read-only view of a document
 * in the Zimbra Ajax client.
 * <p>
 * This class can be used to extract data from the document, such as Name,
 * message body. 
 * <p>
 */

public class DocumentPreview extends AbsDisplay {

	public static class Locators {
	}

	/**
	 * The various displayed fields in a message
	 */
	public static enum Field {
		Name, Time, Date, Body
	}

	/**
	 * Protected constuctor for this object. Only classes within this package
	 * should create PreviewDocument objects.
	 * 
	 * @param application
	 */
	protected DocumentPreview(AbsApplication application) {
		super(application);
		logger.info("new " + DocumentPreview.class.getCanonicalName());
	}

	@Override
	public String myPageName() {
		return (this.getClass().getName());
	}

	/**
	 * Get the string value of the specified field
	 * 
	 * @return the displayed string value
	 * @throws HarnessException
	 */
	public String zGetDocumentProperty(Field field) throws HarnessException {
		logger.info("DocumentPreview.zGetDocumentProperty(" + field + ")");
		String locator = null;

		if (field == Field.Name) {
			throw new HarnessException("implement me!");
		} else if (field == Field.Body) {
			/*
			 * To get the body contents, need to switch iframes
			 */
			try {
				this.sSelectFrame("//iframe[contains(@class, 'PreviewFrame')]");
				String bodyLocator = "css=body";
				// Make sure the body is present
				if (!this.sIsElementPresent(bodyLocator))
					throw new HarnessException("Unable to preview body!");

				// Get the body value
				// String body = this.sGetText(bodyLocator).trim();
				String html = this.zGetHtml(bodyLocator);

				logger.info("DocumentPreview GetBody(" + bodyLocator + ") = "
						+ html);
				return (html);
			} finally {
				// Make sure to go back to the original iframe
				this.sSelectFrame("relative=top");
			}
		} else if (field == Field.Date) {
			locator = "css=";
			this.sGetText(locator);
			throw new HarnessException("implement me!");
		} else if (field == Field.Time) {
			locator = "css=";
			this.sGetText(locator);
			throw new HarnessException("implement me!");
		}

		// Make sure something was set
		if (locator == null)
			throw new HarnessException("locator was null for field = " + field);

		return "";
	}

	@Override
	public boolean zIsActive() throws HarnessException {
		throw new HarnessException("implement me");
	}
}
