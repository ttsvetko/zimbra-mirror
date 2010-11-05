package projects.ajax.ui;

import projects.ajax.ui.Actions.Action;
import projects.ajax.ui.Buttons.Button;
import framework.ui.AbsApplication;
import framework.ui.AbsSeleniumObject;
import framework.util.HarnessException;
import framework.util.ZimbraAccount;

public class PageLogin extends AbsAjaxPage {

	// Buttons
	public static final String zLoginButton = "xpath=//input[@class='zLoginButton']";
	
	// Text Input
	public static final String username = "xpath=//*[@id='username']";
	public static final String password = "xpath=//*[@id='password']";
	public static final String remember = "xpath=//*[@id='remember']";
	
	// Displayed text
	public static final String displayedZLoginAppName = "xpath=//*[@id='ZLoginAppName']";
	public static final String displayedusername = "xpath=//form[@name='loginForm']//label[@for='username']";
	public static final String displayedpassword = "xpath=//td[@class='zLoginLabelContainer']//label[@for='password']";
	public static final String displayedremember = "xpath=//td[@class='zLoginCheckboxLabelContainer']//label[@for='remember']";
	public static final String displayedwhatsthis = "xpath=//*[@id='ZLoginWhatsThisAnchor']";
	public static final String displayedcopyright = "xpath=//div[@class='copyright']";
	
	
	public ZimbraAccount DefaultLoginAccount = null;
	
	public PageLogin(AbsApplication application) {
		super(application);
		
		logger.info("new " + PageLogin.class.getCanonicalName());

	}

	@Override
	public boolean isActive() throws HarnessException {
		
		// Make sure the application is loaded first
		if ( !MyApplication.isLoaded() )
			throw new HarnessException("Admin Console application is not active!");


		// Look for the login button. 
		boolean present = sIsElementPresent(zLoginButton);
		if ( !present ) {
			logger.debug("isActive() present = "+ present);
			return (false);
		}
		
		boolean visible = zIsVisiblePerPosition(zLoginButton, 0 , 0);
		if ( !visible ) {
			logger.debug("isActive() visible = "+ visible);
			return (false);
		}
		
		logger.debug("isActive() = "+ true);
		return (true);
	}

	@Override
	public String myPageName() {
		return (this.getClass().getName());
	}

	@Override
	public void navigateTo() throws HarnessException {

		if ( isActive() ) {
			// This page is already active.
			return;
		}
		
		
		// Logout
		if ( MyApplication.zPageMain.isActive() ) {
			MyApplication.zPageMain.logout();
		}
		
		waitForActive();
		
	}

	/**
	 * Login as DefaultLoginAccount
	 * @throws HarnessException
	 */
	public void login() throws HarnessException {
		logger.debug("login()");

		login(DefaultLoginAccount);
	}

	
	/**
	 * Login as the specified account
	 * @param account
	 * @throws HarnessException
	 */
	public void login(ZimbraAccount account) throws HarnessException {
		logger.debug("login(ZimbraAccount account)" + account.EmailAddress);

		navigateTo();
		
		// Fill out the form
		fillLoginFormFields(account);
		
		// Click the Login button
		sClick(zLoginButton);

		// Wait for the app to load
		MyApplication.zPageMain.waitForActive();
		
		MyApplication.setActiveAcount(account);
		
	}
	
	/**
	 * Fill the form with the specified user
	 * @throws HarnessException
	 */
	public void fillLoginFormFields(ZimbraAccount account) throws HarnessException {
		logger.debug("fillFields(ZimbraAccount account)" + account.EmailAddress);
		
		if ( !isActive() )
			throw new HarnessException("LoginPage is not active");
		
		sType(username, account.EmailAddress);
		sType(password, account.Password);
	}

	@Override
	public AbsSeleniumObject zToolbarPressButton(Button button) throws HarnessException {
		throw new HarnessException("Login page does not have a Toolbar");
	}

	@Override
	public AbsSeleniumObject zToolbarPressPulldown(Button pulldown, Button option) throws HarnessException {
		throw new HarnessException("Login page does not have a Toolbar");
	}

	@Override
	public AbsSeleniumObject zListItem(Action action, String item) throws HarnessException {
		throw new HarnessException("Login page does not have lists");
	}

	@Override
	public AbsSeleniumObject zListItem(Action action, Action option, String item) throws HarnessException {
		throw new HarnessException("Login page does not have lists");
	}



}
